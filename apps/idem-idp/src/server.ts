import Fastify, { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import fastifyStatic from '@fastify/static';
import fastifyHelmet from '@fastify/helmet';
import fastifyCookie from '@fastify/cookie';
import fastifySession from '@fastify/session';
import middie from '@fastify/middie';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { renderHomepage } from './views/homepage';
import { config } from './config';
import { registerInteractionRoutes } from './routes/interaction';
import { registerOtpRoutes } from './routes/otp';
import { registerAdminRoutes } from './routes/admin';
import { FastifyDrizzleSessionStore } from './middleware/fastify-session-store';
import { registerErrorHandler } from './middleware/error-handler';
import type { Mailer } from '@eventuras/mailer';
import { Logger } from '@eventuras/logger';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logger = Logger.create({ namespace: 'idem:server' });

// Extend Fastify session type with our custom fields
declare module 'fastify' {
  interface Session {
    accountId?: string | null;
    authenticatedAt?: string;
    authMethod?: 'otp' | 'idp';
  }
}

/**
 * Creates the Fastify app with optional OIDC provider and mailer.
 * @param oidcProvider - Optional OIDC provider instance
 * @param mailer - Optional mailer instance for OTP routes
 * @returns FastifyInstance
 */
export async function createServer(oidcProvider?: any, mailer?: Mailer): Promise<FastifyInstance> {
  const app = Fastify({
    // Trust proxy (CRITICAL for production behind reverse proxy)
    // Without this: secure cookies fail, req.ip is wrong, session fingerprinting breaks
    // In development: Also needed when using Cloudflare Tunnel for HTTPS
    trustProxy: true,
    logger: false, // We use our own logger
  });

  // Security headers
  // contentSecurityPolicy: false - OIDC provider sets its own CSP
  // TODO (prod hardening): Add CSP for interaction UI pages
  await app.register(fastifyHelmet, { contentSecurityPolicy: false });

  // Request logging
  app.addHook('onRequest', async (request) => {
    logger.debug({ method: request.method, path: request.url }, 'Incoming request');
  });

  // TODO (prod hardening): Rate limiting
  // IMPORTANT: Exempt public endpoints from rate limits to avoid breaking clients:
  //   - /.well-known/openid-configuration (discovery)
  //   - /.well-known/jwks.json (public keys)
  // These endpoints are polled by clients and should always be accessible
  // Only apply rate limits to: /auth, /token, /interaction/* endpoints

  // Health probe (before everything else)
  app.get('/health', async () => ({ status: 'ok' }));

  // Serve static assets (JS, CSS, images) from built UI
  // In dev: __dirname is /path/to/apps/idem-idp/src → go up one level
  // In prod: __dirname is /path/to/apps/idem-idp/dist → go up one level
  const uiDistPath = path.join(__dirname, '../dist-ui');
  await app.register(fastifyStatic, {
    root: path.join(uiDistPath, 'assets'),
    prefix: '/assets/',
    decorateReply: false, // Don't add sendFile to reply (we'll handle SPA serving manually)
  });
  logger.info({ uiDistPath, __dirname }, 'Serving static assets from dist-ui/assets');

  // Cookie and session middleware (BEFORE routes)
  await app.register(fastifyCookie);
  await app.register(fastifySession, {
    store: new FastifyDrizzleSessionStore(),
    secret: config.sessionSecret,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
    cookieName: 'idem.sid',
    rolling: true, // Extend session expiry on each request
  });
  logger.info('Session middleware mounted');

  // OTP API routes
  if (mailer) {
    await app.register(registerOtpRoutes, { mailer });
    logger.info('OTP API routes mounted');
  }

  // Interaction API routes
  if (oidcProvider) {
    await app.register(registerInteractionRoutes, { provider: oidcProvider });
    logger.info('Interaction API routes mounted');
  }

  // Admin API routes
  await app.register(registerAdminRoutes);
  logger.info('Admin API routes mounted');

  // Helper function to serve the React SPA
  const serveSpa = async (_request: FastifyRequest, reply: FastifyReply) => {
    const indexPath = path.join(uiDistPath, 'index.html');
    try {
      const content = fs.readFileSync(indexPath, 'utf-8');
      return reply.type('text/html').send(content);
    } catch {
      logger.warn('Frontend build not found, serving fallback');
      return reply.type('text/html').send(renderHomepage({ name: 'idem-idp', version: config.nodeEnv }));
    }
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
  const clearSessionHandler = async (request: FastifyRequest, reply: FastifyReply) => {
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
        reply.clearCookie(name, { path: '/' });
      }

      logger.debug({ cookies: cookieNames }, 'Session cookies cleared');

      if (request.method === 'POST') {
        return reply.send({ success: true, message: 'Session cookies cleared' });
      } else {
        // Use HTML meta refresh instead of redirect header (more compatible with proxies)
        return reply
          .code(200)
          .type('text/html')
          .send('<html><head><meta http-equiv="refresh" content="0;url=/login?cleared=1"></head><body>Redirecting...</body></html>');
      }
    } catch (err) {
      logger.error({ err }, 'Failed to clear session');
      return reply.code(500).send({ error: 'Failed to clear session' });
    }
  };

  // Mount at /session/clear to avoid conflicts with oidc-provider's /auth/* routes
  app.get('/session/clear', clearSessionHandler);
  app.post('/session/clear', clearSessionHandler);

  // Mount OIDC provider via middie (Express/Connect middleware compatibility)
  // Note: oidc-provider handles its own body parsing for /token, /userinfo, /request endpoints
  // CRITICAL: Do NOT add middleware that accesses req.body before oidc-provider - it will interfere!
  // IMPORTANT: Only handle OIDC-specific paths - let Fastify handle the rest!
  if (oidcProvider) {
    logger.info('Mounting OIDC provider');
    await app.register(middie);

    // OIDC paths that oidc-provider handles
    const oidcPaths = [
      '/.well-known/',
      '/auth',
      '/token',
      '/userinfo',
      '/introspection',
      '/revocation',
      '/certs',
      '/me',
    ];

    // Wrap oidc-provider callback to only handle OIDC-specific paths
    const oidcCallback = oidcProvider.callback();
    const conditionalOidcMiddleware = (req: any, res: any, next: any) => {
      const url = req.url || '';
      const isOidcPath = oidcPaths.some(p => url === p || url.startsWith(p));
      if (isOidcPath) {
        return oidcCallback(req, res, next);
      }
      return next();
    };

    app.use(conditionalOidcMiddleware);

    logger.info({
      endpoints: oidcPaths
    }, 'OIDC routes mounted');
  }

  // SPA fallback - serve index.html for all unmatched routes
  app.setNotFoundHandler(async (request, reply) => {
    const indexPath = path.join(uiDistPath, 'index.html');
    logger.info({ path: request.url, indexPath }, 'SPA fallback hit');

    try {
      const content = fs.readFileSync(indexPath, 'utf-8');
      return reply.type('text/html').send(content);
    } catch {
      logger.warn({ indexPath }, 'Frontend build not found');
      return reply.type('text/html').send(renderHomepage({ name: 'idem-idp', version: config.nodeEnv }));
    }
  });

  // Error handler
  registerErrorHandler(app);

  return app;
}
