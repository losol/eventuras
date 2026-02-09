import type { FastifyPluginAsync } from 'fastify';
import { db } from '../db/client';
import { oauthClients } from '../db/schema/oauth';
import { Logger } from '@eventuras/logger';

const logger = Logger.create({ namespace: 'idem:routes:admin' });

/**
 * Check if a user has one of the required roles for idem-admin (ADR 0018)
 *
 * @param roles - Array of roles from the token's 'roles' claim
 * @param requiredRoles - Roles that grant access (any match is sufficient)
 * @returns true if user has at least one required role
 */
function hasRequiredRole(
  roles: string[] | undefined,
  requiredRoles: string[]
): boolean {
  if (!roles || !Array.isArray(roles)) return false;
  return roles.some((role) => requiredRoles.includes(role));
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

      const accessToken = authHeader.substring(7); // Remove 'Bearer '

      // Decode JWT (simple decode, not verification - OIDC provider already verified it)
      const parts = accessToken.split('.');
      if (parts.length !== 3) {
        logger.warn('Invalid JWT format');
        return reply.code(401).send({ error: 'Unauthorized' });
      }

      const payload = JSON.parse(
        Buffer.from(parts[1]!, 'base64url').toString()
      );

      // ADR 0018: Check if user has systemadmin or admin_reader role for idem-admin
      const roles = payload.roles as string[] | undefined;
      if (!hasRequiredRole(roles, ['systemadmin', 'admin_reader'])) {
        logger.warn(
          { user: payload.email, roles },
          'Unauthorized access attempt to admin API'
        );
        return reply.code(403).send({ error: 'Forbidden' });
      }

      // Fetch all clients from database
      logger.debug('Fetching OAuth clients');
      const clients = await db.select().from(oauthClients);

      logger.info({ count: clients.length, user: payload.email }, 'OAuth clients retrieved');

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
          logoUri: client.logoUri,
          clientUri: client.clientUri,
        })),
      });
    } catch (error) {
      logger.error({ error }, 'Error fetching OAuth clients');
      return reply.code(500).send({ error: 'Internal Server Error' });
    }
  });
};
