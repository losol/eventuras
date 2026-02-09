import type { FastifyPluginAsync } from 'fastify';
import { randomBytes } from 'crypto';
import { db } from '../db/client';
import { accounts } from '../db/schema/account';
import { oauthClients } from '../db/schema/oauth';
import { clientRoles, roleGrants } from '../db/schema/rbac';
import { eq, and } from 'drizzle-orm';
import { config, compareBootstrapToken } from '../config';
import { hashPassword } from '../crypto/hash';
import { Logger } from '@eventuras/logger';

const logger = Logger.create({ namespace: 'idem:routes:bootstrap' });

/**
 * Check if a systemadmin already exists for idem-admin (ADR 0018)
 */
async function hasExistingSystemadmin(): Promise<boolean> {
  const results = await db
    .select({ id: roleGrants.id })
    .from(roleGrants)
    .innerJoin(clientRoles, eq(roleGrants.clientRoleId, clientRoles.id))
    .innerJoin(oauthClients, eq(clientRoles.oauthClientId, oauthClients.id))
    .where(
      and(
        eq(oauthClients.clientId, 'idem-admin'),
        eq(clientRoles.roleName, 'systemadmin')
      )
    )
    .limit(1);

  return results.length > 0;
}

/**
 * Ensure the idem-admin client and systemadmin role exist, creating them if needed.
 * Returns the systemadmin role ID, or null on failure.
 */
async function ensureIdemAdminSetup(): Promise<{ clientId: string; roleId: string } | null> {
  // Find or create idem-admin client
  let [client] = await db
    .select()
    .from(oauthClients)
    .where(eq(oauthClients.clientId, 'idem-admin'))
    .limit(1);

  if (!client) {
    logger.info('Creating idem-admin client');
    const adminUrl = config.adminUrl || 'http://localhost:3210';
    [client] = await db
      .insert(oauthClients)
      .values({
        clientId: 'idem-admin',
        clientName: 'Idem Admin Console',
        clientType: 'confidential',
        clientCategory: 'internal',
        redirectUris: [`${adminUrl}/api/callback`],
        grantTypes: ['authorization_code', 'refresh_token'],
        responseTypes: ['code'],
        allowedScopes: ['openid', 'profile', 'email', 'offline_access'],
        defaultScopes: ['openid', 'profile', 'email'],
        requirePkce: true,
        active: true,
      })
      .returning();

    if (!client) {
      logger.error('Failed to create idem-admin client');
      return null;
    }
  }

  // Find or create systemadmin role
  let [role] = await db
    .select()
    .from(clientRoles)
    .where(
      and(
        eq(clientRoles.oauthClientId, client.id),
        eq(clientRoles.roleName, 'systemadmin')
      )
    )
    .limit(1);

  if (!role) {
    logger.info('Creating systemadmin role for idem-admin');
    [role] = await db
      .insert(clientRoles)
      .values({
        oauthClientId: client.id,
        roleName: 'systemadmin',
        description: 'Full administrative access to Idem',
      })
      .returning();

    if (!role) {
      logger.error('Failed to create systemadmin role');
      return null;
    }
  }

  return { clientId: client.id, roleId: role.id };
}

/**
 * Grant systemadmin role to an account (ADR 0018)
 */
async function grantSystemadmin(accountId: string): Promise<boolean> {
  const setup = await ensureIdemAdminSetup();
  if (!setup) return false;

  await db.insert(roleGrants).values({
    accountId,
    clientRoleId: setup.roleId,
  }).onConflictDoNothing();

  return true;
}

/**
 * Generate and set client_secret for idem-admin if not already set
 * Returns the plaintext secret (only shown once!)
 */
async function ensureAdminClientSecret(): Promise<string | null> {
  // First, check if idem-admin client exists
  const [client] = await db
    .select()
    .from(oauthClients)
    .where(eq(oauthClients.clientId, 'idem-admin'))
    .limit(1);

  if (!client) {
    logger.error('idem-admin client not found');
    return null;
  }

  // Check if client already has a secret
  if (client.clientSecretHash) {
    logger.info('idem-admin client_secret already configured - skipping generation');
    return null;
  }

  // Generate a secure random secret (32 bytes = 64 hex chars)
  const clientSecret = randomBytes(32).toString('hex');
  const secretHash = await hashPassword(clientSecret);

  // Update the client with the hashed secret
  await db
    .update(oauthClients)
    .set({
      clientSecretHash: secretHash,
      updatedAt: new Date(),
    })
    .where(eq(oauthClients.id, client.id));

  logger.info('Generated client_secret for idem-admin');

  return clientSecret;
}

export const registerBootstrapRoutes: FastifyPluginAsync = async (fastify) => {
  /**
   * POST /api/system/init
   *
   * Bootstrap endpoint to initialize the system with the first administrator.
   * Creates systemadmin role grant and generates client_secret for idem-admin.
   * Only available when IDEM_BOOTSTRAP_ENABLED=true.
   *
   * Can either:
   * - Create a new account with provided email (and optional name)
   * - Use an existing account by account_id
   *
   * ADR 0018: Bootstrap mechanism for creating the first systemadmin
   */
  fastify.post<{
    Body: {
      email?: string;
      name?: string;
      account_id?: string;
    };
  }>('/api/system/init', async (request, reply) => {
    // Log all bootstrap attempts for audit
    const clientIp =
      request.headers['x-forwarded-for'] || request.socket.remoteAddress;

    // Check if bootstrap is enabled
    if (!config.bootstrap.enabled) {
      logger.info(
        { clientIp },
        'Bootstrap attempt when bootstrap is disabled'
      );
      return reply.code(404).send({ error: 'Not found' });
    }

    // Validate Authorization header
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.warn({ clientIp }, 'Bootstrap attempt without valid auth header');
      return reply.code(401).send({ error: 'Unauthorized' });
    }

    const providedToken = authHeader.substring(7);

    // Constant-time token comparison
    if (!compareBootstrapToken(providedToken)) {
      logger.warn(
        { clientIp, tokenLength: providedToken.length },
        'Bootstrap attempt with invalid token'
      );
      return reply.code(401).send({ error: 'Unauthorized' });
    }

    // Check if systemadmin already exists
    const hasAdmin = await hasExistingSystemadmin();
    if (hasAdmin) {
      const level = config.nodeEnv === 'production' ? 'error' : 'warn';
      logger[level](
        { clientIp },
        'Bootstrap attempt when systemadmin already exists'
      );
      return reply.code(409).send({
        error: 'Conflict',
        message: 'A systemadmin already exists. Bootstrap is no longer available.',
      });
    }

    // Validate request body - need either email or account_id
    const body = request.body;
    const hasEmail = body?.email && typeof body.email === 'string';
    const hasAccountId = body?.account_id && typeof body.account_id === 'string';

    if (!hasEmail && !hasAccountId) {
      logger.warn({ clientIp }, 'Bootstrap attempt with invalid body');
      return reply.code(400).send({
        error: 'Bad Request',
        message: 'Either email or account_id is required',
      });
    }

    let account: typeof accounts.$inferSelect | undefined;

    if (hasEmail) {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(body.email!)) {
        return reply.code(400).send({
          error: 'Bad Request',
          message: 'Invalid email format',
        });
      }

      // Check if account with this email already exists
      const [existingAccount] = await db
        .select()
        .from(accounts)
        .where(eq(accounts.primaryEmail, body.email!))
        .limit(1);

      if (existingAccount) {
        // Use existing account
        account = existingAccount;
        logger.info(
          { email: body.email },
          'Using existing account for bootstrap'
        );
      } else {
        // Create new account
        // Use provided name as displayName, or derive from email
        const email = body.email as string; // Already validated above
        const displayName = (body.name?.trim() || email.split('@')[0]) as string;

        const [newAccount] = await db
          .insert(accounts)
          .values({
            primaryEmail: email,
            displayName,
            active: true,
          })
          .returning();

        if (!newAccount) {
          logger.error({ email: body.email }, 'Failed to create account');
          return reply.code(500).send({ error: 'Internal Server Error' });
        }

        account = newAccount;
        logger.info(
          { email: body.email, accountId: newAccount.id },
          'Created new account for bootstrap'
        );
      }
    } else {
      // Look up by account_id
      const [existingAccount] = await db
        .select()
        .from(accounts)
        .where(eq(accounts.id, body.account_id!))
        .limit(1);

      if (!existingAccount) {
        logger.warn(
          { clientIp, accountId: body.account_id },
          'Bootstrap attempt for non-existent account'
        );
        return reply.code(404).send({
          error: 'Not Found',
          message: 'Account not found',
        });
      }

      account = existingAccount;
    }

    // Verify account is active
    if (!account || !account.active || account.deletedAt) {
      logger.warn(
        { clientIp, accountId: account?.id },
        'Bootstrap attempt for inactive/deleted account'
      );
      return reply.code(400).send({
        error: 'Bad Request',
        message: 'Account is not active',
      });
    }

    // Grant systemadmin role
    const success = await grantSystemadmin(account.id);
    if (!success) {
      logger.error({ clientIp }, 'Failed to grant systemadmin role');
      return reply.code(500).send({ error: 'Internal Server Error' });
    }

    // Generate client_secret for idem-admin if not already set
    const clientSecret = await ensureAdminClientSecret();

    logger.info(
      {
        clientIp,
        accountId: account.id,
        email: account.primaryEmail,
        accountCreated: hasEmail && !body.account_id,
        clientSecretGenerated: !!clientSecret,
      },
      '🎉 Bootstrap successful - systemadmin role granted'
    );

    // Build response
    const response: {
      message: string;
      account_id: string;
      email: string;
      role: string;
      client_id: string;
      client_secret?: string;
      note: string;
    } = {
      message: 'Bootstrap successful',
      account_id: account.id,
      email: account.primaryEmail!,
      role: 'systemadmin',
      client_id: 'idem-admin',
      note: 'Remember to disable IDEM_BOOTSTRAP_ENABLED after bootstrap',
    };

    // Only include client_secret if it was generated now
    // This is the ONLY time the secret is shown - save it!
    if (clientSecret) {
      response.client_secret = clientSecret;
      response.note = 'IMPORTANT: Save the client_secret now. This is the only time it will be shown. Remember to disable IDEM_BOOTSTRAP_ENABLED after bootstrap.';
    }

    return reply.send(response);
  });
};
