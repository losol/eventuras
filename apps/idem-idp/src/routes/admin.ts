import { Router } from 'express';
import { db } from '../db/client';
import { oauthClients } from '../db/schema/oauth';
import { Logger } from '@eventuras/logger';

const logger = Logger.create({ namespace: 'idem:routes:admin' });

export function createAdminRoutes(): Router {
  const router = Router();

  /**
   * GET /api/admin/clients
   * Returns list of all OAuth clients
   * Requires authentication with Bearer token
   */
  router.get('/api/admin/clients', async (req, res) => {
    try {
      // Get access token from Authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        logger.warn('Missing or invalid Authorization header');
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const accessToken = authHeader.substring(7); // Remove 'Bearer '

      // Decode JWT (simple decode, not verification - OIDC provider already verified it)
      const parts = accessToken.split('.');
      if (parts.length !== 3) {
        logger.warn('Invalid JWT format');
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const payload = JSON.parse(
        Buffer.from(parts[1], 'base64').toString()
      );

      // Check if user has system_admin or admin_reader role
      const systemRole = payload.system_role;
      if (!systemRole || !['system_admin', 'admin_reader'].includes(systemRole)) {
        logger.warn(
          { user: payload.email, systemRole },
          'Unauthorized access attempt to admin API'
        );
        return res.status(403).json({ error: 'Forbidden' });
      }

      // Fetch all clients from database
      logger.debug('Fetching OAuth clients');
      const clients = await db.select().from(oauthClients);

      logger.info({ count: clients.length, user: payload.email }, 'OAuth clients retrieved');

      return res.json({
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
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  return router;
}
