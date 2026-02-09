import { createServer } from './server';
import { createOidcProvider } from './oidc/provider';
import { config, validateConfig } from './config';
import { bootstrapKeys } from './crypto/jwks';
import { createMailerFromEnv } from '@eventuras/mailer';
import { Logger } from '@eventuras/logger';
import { db } from './db/client';
import { accounts } from './db/schema/account';
import { oauthClients } from './db/schema/oauth';
import { clientRoles, roleGrants } from './db/schema/rbac';
import { eq, and } from 'drizzle-orm';

const logger = Logger.create({ namespace: 'idem:main' });

/**
 * Get roles for an account for idem-admin (ADR 0018)
 */
async function getIdemAdminRoles(accountId: string): Promise<string[]> {
  const results = await db
    .select({ roleName: clientRoles.roleName })
    .from(roleGrants)
    .innerJoin(clientRoles, eq(roleGrants.clientRoleId, clientRoles.id))
    .innerJoin(oauthClients, eq(clientRoles.oauthClientId, oauthClients.id))
    .where(
      and(eq(roleGrants.accountId, accountId), eq(oauthClients.clientId, 'idem-admin'))
    );
  return results.map((r) => r.roleName);
}

/**
 * Ensure IDEM_ADMIN_URL callback is in idem-admin's allowed redirect_uris
 *
 * This allows configuring the admin console URL via environment variable
 * without manually updating the database.
 */
async function syncAdminRedirectUri() {
  const adminCallbackUrl = `${config.adminUrl}/callback`;

  try {
    const [client] = await db
      .select()
      .from(oauthClients)
      .where(eq(oauthClients.clientId, 'idem-admin'))
      .limit(1);

    if (!client) {
      logger.warn('idem-admin client not found - skipping redirect_uri sync');
      return;
    }

    const currentUris = (client.redirectUris as string[]) || [];

    if (!currentUris.includes(adminCallbackUrl)) {
      const updatedUris = [...currentUris, adminCallbackUrl];
      await db
        .update(oauthClients)
        .set({ redirectUris: updatedUris, updatedAt: new Date() })
        .where(eq(oauthClients.id, client.id));

      logger.info(
        { adminUrl: config.adminUrl, callbackUrl: adminCallbackUrl },
        'Added IDEM_ADMIN_URL callback to idem-admin redirect_uris'
      );
    } else {
      logger.debug(
        { callbackUrl: adminCallbackUrl },
        'Admin callback URL already in redirect_uris'
      );
    }
  } catch (error) {
    logger.error({ error }, 'Failed to sync admin redirect_uri');
  }
}

async function logTestAccounts() {
  if (config.nodeEnv !== 'development') return;

  try {
    const testAccounts = await db
      .select({
        id: accounts.id,
        email: accounts.primaryEmail,
        displayName: accounts.displayName,
      })
      .from(accounts)
      .where(eq(accounts.active, true))
      .limit(10);

    if (testAccounts.length > 0) {
      logger.info('Test accounts available for login:');
      for (const acc of testAccounts) {
        const roles = await getIdemAdminRoles(acc.id);
        logger.info(
          {
            accountId: acc.id,
            email: acc.email,
            name: acc.displayName,
            roles: roles.length > 0 ? roles : ['(no admin roles)'],
          },
          `  -> ${acc.displayName} (${acc.email})`
        );
      }
    } else {
      logger.warn('No test accounts found. Run: pnpm db:seed');
    }
  } catch (error) {
    logger.warn({ error }, 'Could not load test accounts');
  }
}

/**
 * Check bootstrap status and log appropriate warnings (ADR 0018)
 */
async function checkBootstrapStatus() {
  if (!config.bootstrap.enabled) return;

  // Check if systemadmin already exists
  const existingAdmins = await db
    .select({ id: roleGrants.id })
    .from(roleGrants)
    .innerJoin(clientRoles, eq(roleGrants.clientRoleId, clientRoles.id))
    .innerJoin(oauthClients, eq(clientRoles.oauthClientId, oauthClients.id))
    .where(
      and(eq(oauthClients.clientId, 'idem-admin'), eq(clientRoles.roleName, 'systemadmin'))
    )
    .limit(1);

  if (existingAdmins.length > 0) {
    if (config.nodeEnv === 'production') {
      logger.error(
        'IDEM_BOOTSTRAP_ENABLED=true but systemadmin already exists! ' +
          'Bootstrap endpoint is disabled. Set IDEM_BOOTSTRAP_ENABLED=false.'
      );
    } else {
      logger.warn(
        'IDEM_BOOTSTRAP_ENABLED=true but systemadmin already exists. ' +
          'Bootstrap endpoint is disabled.'
      );
    }
  } else {
    logger.info(
      'Bootstrap mode enabled. POST /api/bootstrap with IDEM_BOOTSTRAP_TOKEN to claim systemadmin.'
    );
  }
}

async function main() {
  logger.info('Starting Idem IdP');

  validateConfig();
  await bootstrapKeys();
  await syncAdminRedirectUri(); // Sync IDEM_ADMIN_URL before loading clients
  await checkBootstrapStatus();
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
