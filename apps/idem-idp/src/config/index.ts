import { Logger } from '@eventuras/logger';
import { timingSafeEqual } from 'crypto';

const logger = Logger.create({ namespace: 'idem:config' });

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',

  // Issuer URL (can be overridden with IDEM_ISSUER for Cloudflare Tunnel)
  issuer: process.env.IDEM_ISSUER || {
    development: 'http://localhost:3200',
    staging: 'https://auth-staging.eventuras.com',
    production: 'https://auth.eventuras.com',
    test: 'http://localhost:3200',
  }[process.env.NODE_ENV || 'development'],

  databaseUrl: process.env.IDEM_DATABASE_URL || 'postgresql://idem:idem@localhost:5432/idem',
  sessionSecret: process.env.IDEM_SESSION_SECRET || 'dev-session-secret-DO-NOT-USE-IN-PROD',
  masterKey: process.env.IDEM_MASTER_KEY || 'dev-master-key-DO-NOT-USE-IN-PROD', // For JWKS encryption
  port: Number(process.env.PORT) || 3200,

  // Localization and branding
  locale: process.env.IDEM_LOCALE || process.env.DEFAULT_LOCALE || 'nb-NO',
  appName: process.env.IDEM_APP_NAME || 'Eventuras ID',

  // Admin console URL (for dynamic redirect_uri configuration)
  adminUrl: process.env.IDEM_ADMIN_URL || 'http://localhost:3201',

  // ADR 0018: Bootstrap configuration for first systemadmin
  bootstrap: {
    enabled: process.env.IDEM_BOOTSTRAP_ENABLED === 'true',
    token: process.env.IDEM_BOOTSTRAP_TOKEN || '',
  },

  features: {
    devShortcuts: process.env.NODE_ENV === 'development',
    mockIdPs: process.env.NODE_ENV === 'development',
    requireHttps: process.env.NODE_ENV !== 'development',
  },
} as const;

/**
 * Constant-time token comparison to prevent timing attacks (ADR 0018)
 */
export function compareBootstrapToken(providedToken: string): boolean {
  if (!config.bootstrap.token || !providedToken) return false;

  const expected = Buffer.from(config.bootstrap.token);
  const provided = Buffer.from(providedToken);

  // Must be same length for timing-safe comparison
  if (expected.length !== provided.length) return false;

  return timingSafeEqual(expected, provided);
}

export function validateConfig() {
  if (!config.nodeEnv || !['development', 'staging', 'production'].includes(config.nodeEnv)) {
    throw new Error('NODE_ENV must be development, staging, or production');
  }
  if (config.nodeEnv !== 'development') {
    if (!config.sessionSecret || config.sessionSecret === 'dev-session-secret-DO-NOT-USE-IN-PROD') {
      throw new Error('IDEM_SESSION_SECRET is required and must not use the development default in non-development environments');
    }
    if (!config.masterKey || config.masterKey === 'dev-master-key-DO-NOT-USE-IN-PROD') {
      throw new Error('IDEM_MASTER_KEY is required and must not use the development default in non-development environments');
    }
  }

  // IDEM_BOOTSTRAP_TOKEN should be at least 32 characters for security (ADR 0018)
  if (config.bootstrap.enabled && config.bootstrap.token.length < 32) {
    logger.warn(
      'IDEM_BOOTSTRAP_TOKEN should be at least 32 characters for security'
    );
  }

  logger.info({ environment: config.nodeEnv }, 'Config validated');
}
