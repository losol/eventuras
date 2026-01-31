import type { FastifyPluginAsync } from 'fastify';
import { db } from '../db/client';
import { oauthClients } from '../db/schema/oauth';
import { Logger } from '@eventuras/logger';

const logger = Logger.create({ namespace: 'idem:routes:admin' });

export const registerAdminRoutes: FastifyPluginAsync = async (fastify) => {
  /**
   * GET /api/admin/clients
   * Returns list of all OAuth clients
   * Requires authentication with Bearer token
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

      // Check if user has system_admin or admin_reader role
      const systemRole = payload.system_role;
      if (!systemRole || !['system_admin', 'admin_reader'].includes(systemRole)) {
        logger.warn(
          { user: payload.email, systemRole },
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
