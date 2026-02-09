import type { FastifyPluginAsync } from 'fastify';
import { db } from '../db/client';
import { oauthClients } from '../db/schema/oauth';
import { clientRoles, roleGrants } from '../db/schema/rbac';
import { eq, and } from 'drizzle-orm';
import { verifyAccessToken } from '../auth/verify';
import { Logger } from '@eventuras/logger';

const logger = Logger.create({ namespace: 'idem:routes:admin' });

/**
 * Look up roles for an account on a specific client (ADR 0018)
 */
async function getRolesForClient(accountId: string, clientId: string): Promise<string[]> {
  const results = await db
    .select({ roleName: clientRoles.roleName })
    .from(roleGrants)
    .innerJoin(clientRoles, eq(roleGrants.clientRoleId, clientRoles.id))
    .innerJoin(oauthClients, eq(clientRoles.oauthClientId, oauthClients.id))
    .where(
      and(eq(roleGrants.accountId, accountId), eq(oauthClients.clientId, clientId))
    );

  return results.map((r) => r.roleName);
}

export const registerAdminRoutes: FastifyPluginAsync = async (fastify) => {
  /**
   * GET /api/admin/clients
   * Returns list of all OAuth clients
   * Requires authentication with Bearer token and systemadmin or admin_reader role
   */
  fastify.get('/api/admin/clients', async (request, reply) => {
    try {
      // Get access token from Authorization header
      const authHeader = request.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        logger.warn('Missing or invalid Authorization header');
        return reply.code(401).send({ error: 'Unauthorized' });
      }

      const token = authHeader.substring(7);

      // Verify JWT signature against local JWKS
      const verified = await verifyAccessToken(token);
      if (!verified) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }

      // Ensure the token was issued for idem-admin
      if (verified.clientId !== 'idem-admin') {
        logger.warn(
          { clientId: verified.clientId, sub: verified.sub },
          'Token not issued for idem-admin'
        );
        return reply.code(403).send({ error: 'Forbidden' });
      }

      // Look up roles from database (source of truth, not token claims)
      const roles = await getRolesForClient(verified.sub, 'idem-admin');
      if (!roles.some((r) => ['systemadmin', 'admin_reader'].includes(r))) {
        logger.warn(
          { sub: verified.sub, roles },
          'Unauthorized access attempt to admin API'
        );
        return reply.code(403).send({ error: 'Forbidden' });
      }

      // Fetch all clients from database
      logger.debug('Fetching OAuth clients');
      const clients = await db.select().from(oauthClients);

      logger.info({ count: clients.length, sub: verified.sub }, 'OAuth clients retrieved');

      return reply.send({
        clients: clients.map((client) => ({
          id: client.id,
          clientId: client.clientId,
          clientName: client.clientName,
          clientType: client.clientType,
          clientCategory: client.clientCategory,
          redirectUris: client.redirectUris,
          grantTypes: client.grantTypes,
          responseTypes: client.responseTypes,
          allowedScopes: client.allowedScopes,
          requirePkce: client.requirePkce,
          active: client.active,
          createdAt: client.createdAt,
        })),
      });
    } catch (error) {
      logger.error({ error }, 'Error fetching OAuth clients');
      return reply.code(500).send({ error: 'Internal Server Error' });
    }
  });
};
