// Express app with Next.js integration
import express, { type Request, type Response } from 'express';
import helmet from 'helmet';
import { renderHomepage } from './views/homepage';
import { config } from './config';
import { createInteractionRoutes } from './routes/interaction';
import { createOtpRoutes } from './routes/otp';
import { createSessionMiddleware } from './middleware/session';
import type { Mailer } from '@eventuras/mailer';
import { Logger } from '@eventuras/logger';

const logger = Logger.create({ namespace: 'idem:server' });

type NextHandler = (req: Request, res: Response) => Promise<void>;

/**
 * Creates the Express app with optional OIDC provider, mailer, and Next.js handler.
 * @param oidcProvider - Optional OIDC provider instance
 * @param mailer - Optional mailer instance for OTP routes
 * @param nextHandler - Optional Next.js request handler
 * @returns Express.Application
 */
export function createServer(oidcProvider?: any, mailer?: Mailer, nextHandler?: NextHandler): express.Application {
  const app = express();

  // Trust proxy (CRITICAL for production behind reverse proxy)
  // Without this: secure cookies fail, req.ip is wrong, session fingerprinting breaks
  if (config.nodeEnv !== 'development') {
    app.set('trust proxy', 1);
  }

  // Security headers
  // contentSecurityPolicy: false - OIDC provider sets its own CSP
  // TODO (prod hardening): Add CSP for interaction UI pages
  app.use(helmet({ contentSecurityPolicy: false }));

  // TODO (prod hardening): Rate limiting
  // IMPORTANT: Exempt public endpoints from rate limits to avoid breaking clients:
  //   - /.well-known/openid-configuration (discovery)
  //   - /.well-known/jwks.json (public keys)
  // These endpoints are polled by clients and should always be accessible
  // Only apply rate limits to: /auth, /token, /interaction/* endpoints

  // Health probe (before everything else)
  app.get('/health', (_req, res) => res.json({ status: 'ok' }));

  // Root page (HTML from view)
  app.get('/', (_req, res) => {
    const name = 'idem-idp';
    const version = process.env.npm_package_version ?? 'dev';
    res.type('html').send(renderHomepage({ name, version }));
  });

  // Session middleware (BEFORE body parsers and routes)
  app.use(createSessionMiddleware());
  logger.info('Session middleware mounted');

  // Body parsers for API routes (BEFORE interaction routes, AFTER/parallel to oidc-provider)
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  // OTP API routes (need body parsing and mailer)
  if (mailer) {
    app.use(createOtpRoutes(mailer));
    logger.info('OTP API routes mounted');
  }

  // Interaction API routes (need body parsing)
  if (oidcProvider) {
    app.use(createInteractionRoutes(oidcProvider));
    logger.info('Interaction API routes mounted');
  }

  // Mount OIDC provider
  // Note: oidc-provider handles its own body parsing for /token, /userinfo, /request endpoints
  // Our body parsers above won't interfere because oidc-provider routes are mounted after and have specific paths
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

  // Next.js handler for all other routes (UI pages)
  // Use middleware without a path to catch all remaining requests
  if (nextHandler) {
    logger.info('Mounting Next.js handler');
    app.use((req, res) => nextHandler(req, res));
  }

  return app;
}
