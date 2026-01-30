// Express app (no HTML inline)
import express from 'express';
import helmet from 'helmet';
import type Provider from 'oidc-provider';
import { renderHomepage } from './views/homepage';
import { config } from './config';
import { Logger } from '@eventuras/logger';

const logger = Logger.create({ namespace: 'idem:server' });

/**
 * Creates the Express app with optional OIDC provider.
 * @param oidcProvider - Optional OIDC provider instance
 * @returns Express.Application
 */
export function createServer(oidcProvider?: Provider) {
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

  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  // Health probe
  app.get('/health', (_req, res) => res.json({ status: 'ok' }));

  // Root page (HTML from view)
  app.get('/', (_req, res) => {
    const name = 'idem-idp';
    const version = process.env.npm_package_version ?? 'dev';
    res.type('html').send(renderHomepage({ name, version }));
  });

  // Mount OIDC provider
  if (oidcProvider) {
    logger.info('Mounting OIDC provider');
    app.use(oidcProvider.callback());
    logger.info({
      endpoints: [
        '/.well-known/openid-configuration',
        '/.well-known/jwks.json',
        '/auth',
        '/token',
        '/me'
      ]
    }, 'OIDC routes mounted');
  }

  return app;
}
