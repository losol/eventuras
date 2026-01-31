import express from 'express';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import { renderHomepage } from './views/homepage';
import { config } from './config';
import { createInteractionRoutes } from './routes/interaction';
import { createOtpRoutes } from './routes/otp';
import { createAdminRoutes } from './routes/admin';
import { createSessionMiddleware } from './middleware/session';
import { errorHandler } from './middleware/error-handler';
import type { Mailer } from '@eventuras/mailer';
import { Logger } from '@eventuras/logger';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logger = Logger.create({ namespace: 'idem:server' });

/**
 * Creates the Express app with optional OIDC provider and mailer.
 * @param oidcProvider - Optional OIDC provider instance
 * @param mailer - Optional mailer instance for OTP routes
 * @returns Express.Application
 */
export function createServer(oidcProvider?: any, mailer?: Mailer): express.Application {
  const app = express();

  // Trust proxy (CRITICAL for production behind reverse proxy)
  // Without this: secure cookies fail, req.ip is wrong, session fingerprinting breaks
  // In development: Also needed when using Cloudflare Tunnel for HTTPS
  app.set('trust proxy', 1);

  // Security headers
  // contentSecurityPolicy: false - OIDC provider sets its own CSP
  // TODO (prod hardening): Add CSP for interaction UI pages
  app.use(helmet({ contentSecurityPolicy: false }));

  // Request logging
  app.use((req, res, next) => {
    logger.debug({ method: req.method, path: req.path }, 'Incoming request');
    next();
  });

  // TODO (prod hardening): Rate limiting
  // IMPORTANT: Exempt public endpoints from rate limits to avoid breaking clients:
  //   - /.well-known/openid-configuration (discovery)
  //   - /.well-known/jwks.json (public keys)
  // These endpoints are polled by clients and should always be accessible
  // Only apply rate limits to: /auth, /token, /interaction/* endpoints

  // Health probe (before everything else)
  app.get('/health', (_req, res) => res.json({ status: 'ok' }));

  // Serve static assets (JS, CSS, images) from built UI
  // In dev: __dirname is /path/to/apps/idem-idp/src → go up one level
  // In prod: __dirname is /path/to/apps/idem-idp/dist → go up one level
  const uiDistPath = path.join(__dirname, '../dist-ui');
  app.use('/assets', express.static(path.join(uiDistPath, 'assets')));
  logger.info({ uiDistPath, __dirname }, 'Serving static assets from dist-ui/assets');

  // Session middleware (BEFORE routes)
  app.use(createSessionMiddleware());
  logger.info('Session middleware mounted');

  // CRITICAL: DO NOT apply body parsers globally
  // OIDC provider must parse /token, /userinfo, etc. itself
  // Apply parsers only to routes that need them

  // OTP API routes (need body parsing)
  if (mailer) {
    app.use(createOtpRoutes(mailer));
    logger.info('OTP API routes mounted');
  }

  // Interaction API routes (need body parsing)
  if (oidcProvider) {
    app.use(createInteractionRoutes(oidcProvider));
    logger.info('Interaction API routes mounted');
  }

  // Admin API routes (need body parsing)
  app.use(createAdminRoutes());
  logger.info('Admin API routes mounted');

  // Helper function to serve the React SPA
  const serveSpa = (_req: express.Request, res: express.Response) => {
    const indexPath = path.join(uiDistPath, 'index.html');
    res.sendFile(indexPath, (err) => {
      if (err) {
        logger.warn({ error: err.message }, 'Frontend build not found, serving fallback');
        res.type('html').send(renderHomepage({ name: 'idem-idp', version: config.nodeEnv }));
      }
    });
  };

  // Serve frontend routes BEFORE OIDC provider (so they don't get caught by oidc-provider)
  app.get('/', serveSpa);
  app.get('/login', serveSpa);
  app.get('/callback', serveSpa);
  app.get('/error', serveSpa);
  app.get('/admin', serveSpa);
  app.get('/admin/clients', serveSpa); // Admin subroutes
  app.get('/interaction/:uid', serveSpa); // Interaction UI (API routes at /interaction/:uid/details, etc.)

  // Clear session endpoint - clears OIDC cookies and redirects to login
  const clearSessionHandler = (req: express.Request, res: express.Response) => {
    try {
      // Clear cookies with path=/ (oidc-provider sets cookies on /)
      const cookieNames = [
        '_session', '_session.sig',
        '_interaction', '_interaction.sig',
        '_interaction_resume', '_interaction_resume.sig',
        '_state', '_state.sig',
        'idem.sid',
      ];

      for (const name of cookieNames) {
        res.clearCookie(name, { path: '/' });
      }

      logger.debug({ cookies: cookieNames }, 'Session cookies cleared');

      if (req.method === 'POST') {
        res.json({ success: true, message: 'Session cookies cleared' });
      } else {
        // Use HTML meta refresh instead of redirect header (more compatible with proxies)
        res.status(200).type('html').send(
          '<html><head><meta http-equiv="refresh" content="0;url=/login?cleared=1"></head><body>Redirecting...</body></html>'
        );
      }
    } catch (err) {
      logger.error({ err }, 'Failed to clear session');
      res.status(500).json({ error: 'Failed to clear session' });
    }
  };

  // Mount at /session/clear to avoid conflicts with oidc-provider's /auth/* routes
  app.get('/session/clear', clearSessionHandler);
  app.post('/session/clear', clearSessionHandler);

  // Mount OIDC provider
  // Note: oidc-provider handles its own body parsing for /token, /userinfo, /request endpoints
  // CRITICAL: Do NOT add middleware that accesses req.body before oidc-provider - it will interfere!
  if (oidcProvider) {
    logger.info('Mounting OIDC provider');
    app.use(oidcProvider.callback());
    logger.info({
      endpoints: [
        '/.well-known/openid-configuration',
        '/.well-known/jwks.json',
        '/auth',
        '/token',
        '/userinfo'
      ]
    }, 'OIDC routes mounted');
  }

  // SPA fallback - serve index.html for all unmatched routes (BEFORE error handler)
  app.use((req, res) => {
    const indexPath = path.join(uiDistPath, 'index.html');
    logger.info({ path: req.path, indexPath }, 'SPA fallback hit');

    res.sendFile(indexPath, (err) => {
      if (err) {
        logger.warn({ error: err.message, indexPath }, 'Frontend build not found');
        res.type('html').send(renderHomepage({ name: 'idem-idp', version: config.nodeEnv }));
      }
    });
  });

  // Error handler (MUST be last - after all routes and middleware)
  app.use(errorHandler);

  return app;
}
