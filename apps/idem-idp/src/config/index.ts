import { Logger } from '@eventuras/logger';

const logger = Logger.create({ namespace: 'idem:config' });

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',

  // Static issuer per environment
  issuer: {
    development: 'http://localhost:3200',
    staging: 'https://auth-staging.eventuras.com',
    production: 'https://auth.eventuras.com',
  }[process.env.NODE_ENV || 'development'],

  databaseUrl: process.env.IDEM_DATABASE_URL || 'postgresql://idem:idem@localhost:5432/idem',
  sessionSecret: process.env.IDEM_SESSION_SECRET || 'dev-session-secret-DO-NOT-USE-IN-PROD',
  masterKey: process.env.IDEM_MASTER_KEY || 'dev-master-key-DO-NOT-USE-IN-PROD', // For JWKS encryption
  port: Number(process.env.PORT) || 3200,

  features: {
    devShortcuts: process.env.NODE_ENV === 'development',
    mockIdPs: process.env.NODE_ENV === 'development',
    requireHttps: process.env.NODE_ENV !== 'development',
  },
} as const;

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
  logger.info({ environment: config.nodeEnv }, 'Config validated');
}
