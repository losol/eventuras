import { Router } from 'express';
import type Provider from 'oidc-provider';
import { Logger } from '@eventuras/logger';

const logger = Logger.create({ namespace: 'idem:interaction' });

/**
 * Create interaction routes for OIDC flows
 * These are API endpoints that handle login and consent
 */
export function createInteractionRoutes(provider: any): Router {
  const router = Router();

  /**
   * GET /interaction/:uid/details
   * Returns interaction details for frontend rendering
   * Note: Must be /interaction/* (not /api/interaction/*) to match OIDC cookie paths
   */
  router.get('/interaction/:uid/details', async (req, res) => {
    const { uid } = req.params;

    try {
      const details = await provider.interactionDetails(req, res);

      logger.info({
        uid,
        prompt: details.prompt.name,
        clientId: details.params.client_id,
      }, 'Interaction details requested');

      res.json({
        uid: details.uid,
        prompt: details.prompt,
        params: details.params,
        session: details.session,
      });
    } catch (err) {
      logger.error({ err, uid }, 'Failed to get interaction details');
      res.status(500).json({ error: 'Failed to get interaction details' });
    }
  });

  /**
   * POST /interaction/:uid/login
   * Process login submission (dev: auto-login, prod: verify credentials)
   * Note: Must be /interaction/* (not /api/interaction/*) to match OIDC cookie paths
   */
  router.post('/interaction/:uid/login', async (req, res) => {
    const { uid } = req.params;
    const { accountId } = req.body;

    try {
      logger.info({ uid, accountId }, 'Processing login');

      // TODO: In production, verify credentials here
      // For dev: accept any accountId (from seed data or test)

      // IMPORTANT: interactionFinished() sends response (redirect)
      // Do NOT send res.json() after this - it will fail with "headers already sent"
      await provider.interactionFinished(req, res, {
        login: { accountId },
      }, { mergeWithLastSubmission: false });

      logger.info({ uid, accountId }, 'Login successful');
      // Provider handles response - just return
      return;
    } catch (err) {
      logger.error({ err, uid }, 'Login failed');
      // Only send error if interactionFinished didn't send response
      if (!res.headersSent) {
        res.status(500).json({ error: 'Login failed' });
      }
    }
  });

  /**
   * POST /interaction/:uid/consent
   * Process consent submission
   * Note: Must be /interaction/* (not /api/interaction/*) to match OIDC cookie paths
   */
  router.post('/interaction/:uid/consent', async (req, res) => {
    const { uid } = req.params;
    const { rejectedScopes = [], rejectedClaims = [] } = req.body;

    try {
      logger.info({
        uid,
        rejectedScopes,
        rejectedClaims,
        cookies: req.headers.cookie,
      }, 'Processing consent');

      // IMPORTANT: interactionFinished() sends response (redirect)
      await provider.interactionFinished(req, res, {
        consent: { rejectedScopes, rejectedClaims },
      }, { mergeWithLastSubmission: true });

      logger.info({ uid }, 'Consent granted');
      // Provider handles response - just return
      return;
    } catch (err) {
      logger.error({ err, uid }, 'Consent failed');
      if (!res.headersSent) {
        res.status(500).json({ error: 'Consent failed' });
      }
    }
  });

  return router;
}
