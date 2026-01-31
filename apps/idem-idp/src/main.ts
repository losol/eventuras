import { createServer } from './server';
import { createOidcProvider } from './oidc/provider';
import { config, validateConfig } from './config';
import { bootstrapKeys } from './crypto/jwks';
import { createMailerFromEnv } from '@eventuras/mailer';
import { Logger } from '@eventuras/logger';
import { db } from './db/client';
import { accounts } from './db/schema/account';
import { eq } from 'drizzle-orm';

const logger = Logger.create({ namespace: 'idem:main' });

async function logTestAccounts() {
  if (config.nodeEnv !== 'development') return;

  try {
    const testAccounts = await db.select({
      id: accounts.id,
      email: accounts.primaryEmail,
      displayName: accounts.displayName,
      systemRole: accounts.systemRole,
    })
    .from(accounts)
    .where(eq(accounts.active, true))
    .limit(10);

    if (testAccounts.length > 0) {
      logger.info('Test accounts available for login:');
      testAccounts.forEach(acc => {
        logger.info({
          accountId: acc.id,
          email: acc.email,
          name: acc.displayName,
          role: acc.systemRole || 'user',
        }, `  -> ${acc.displayName} (${acc.email})`);
      });
    } else {
      logger.warn('No test accounts found. Run: pnpm db:seed');
    }
  } catch (error) {
    logger.warn({ error }, 'Could not load test accounts');
  }
}

async function main() {
  logger.info('Starting Idem IdP');

  validateConfig();
  await bootstrapKeys();
  await logTestAccounts();

  // Initialize mailer
  const mailer = createMailerFromEnv();
  logger.info('Mailer initialized');

  const oidcProvider = await createOidcProvider();
  const app = await createServer(oidcProvider, mailer);

  try {
    await app.listen({ port: config.port, host: '0.0.0.0' });
    logger.info({
      issuer: config.issuer,
      port: config.port,
      discoveryEndpoint: `${config.issuer}/.well-known/openid-configuration`
    }, 'Idem IdP listening');
  } catch (err) {
    logger.fatal({ error: err }, 'Failed to start server');
    process.exit(1);
  }
}

main().catch(error => {
  logger.fatal({ error }, 'Startup failed');
  process.exit(1);
});
