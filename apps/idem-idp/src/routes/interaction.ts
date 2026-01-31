import type { FastifyPluginAsync, FastifyReply } from 'fastify';
import { Logger } from '@eventuras/logger';

const logger = Logger.create({ namespace: 'idem:interaction' });

interface InteractionRoutesOptions {
  provider: any;
}

interface InteractionParams {
  uid: string;
}

interface LoginBody {
  accountId: string;
}

interface ConsentBody {
  rejectedScopes?: string[];
  rejectedClaims?: string[];
}

// Simple cookie clearing - just the essential cookies with path=/
const cookieNames = [
  '_session', '_session.sig',
  '_interaction', '_interaction.sig',
  '_interaction_resume', '_interaction_resume.sig',
  '_state', '_state.sig',
  'idem.sid',
];

function clearOidcCookies(reply: FastifyReply) {
  for (const name of cookieNames) {
    reply.clearCookie(name, { path: '/' });
  }
}

/**
 * Interaction routes plugin for OIDC flows
 * These are API endpoints that handle login and consent
 */
export const registerInteractionRoutes: FastifyPluginAsync<InteractionRoutesOptions> = async (fastify, opts) => {
  const { provider } = opts;

  /**
   * GET /interaction/clear-session - redirect to /session/clear
   */
  fastify.get('/interaction/clear-session', async (_request, reply) => {
    return reply.redirect('/session/clear');
  });

  /**
   * POST /interaction/clear-session
   */
  fastify.post('/interaction/clear-session', async (_request, reply) => {
    clearOidcCookies(reply);
    return reply.send({ success: true, message: 'Session cookies cleared' });
  });

  /**
   * GET /interaction/:uid/details
   * Returns interaction details for frontend rendering
   * Note: Must be /interaction/* (not /api/interaction/*) to match OIDC cookie paths
   */
  fastify.get<{ Params: InteractionParams }>('/interaction/:uid/details', async (request, reply) => {
    const { uid } = request.params;

    try {
      logger.info({
        uid,
        cookies: request.headers.cookie,
        hasInteractionCookie: request.headers.cookie?.includes('_interaction'),
      }, 'Fetching interaction details');

      // Use raw Node.js request/response for oidc-provider compatibility
      const details = await provider.interactionDetails(request.raw, reply.raw);

      logger.info({
        uid,
        prompt: details.prompt.name,
        clientId: details.params.client_id,
      }, 'Interaction details requested');

      return reply.send({
        uid: details.uid,
        prompt: details.prompt,
        params: details.params,
        session: details.session,
      });
    } catch (err) {
      logger.error({
        err,
        uid,
        errorMessage: err instanceof Error ? err.message : 'Unknown error',
        errorStack: err instanceof Error ? err.stack : undefined,
      }, 'Failed to get interaction details');
      return reply.code(500).send({
        error: 'Failed to get interaction details',
        details: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  });

  /**
   * POST /interaction/:uid/login
   * Process login submission (dev: auto-login, prod: verify credentials)
   * Note: Must be /interaction/* (not /api/interaction/*) to match OIDC cookie paths
   * Returns JSON with redirectTo URL instead of doing redirect (to avoid CORS issues)
   */
  fastify.post<{ Params: InteractionParams; Body: LoginBody }>('/interaction/:uid/login', async (request, reply) => {
    const { uid } = request.params;
    const { accountId } = request.body;

    try {
      logger.info({
        uid,
        accountId,
        protocol: request.protocol,
        forwardedProto: request.headers['x-forwarded-proto'],
        host: request.headers.host,
      }, 'Processing login');

      // TODO: In production, verify credentials here
      // For dev: accept any accountId (from seed data or test)

      // Use interactionResult() instead of interactionFinished() to get redirect URL
      // This avoids CORS issues with cross-origin redirects in fetch()
      const redirectTo = await provider.interactionResult(request.raw, reply.raw, {
        login: { accountId },
      }, { mergeWithLastSubmission: false });

      logger.info({ uid, accountId, redirectTo }, 'Login successful');

      return reply.send({ redirectTo });
    } catch (err) {
      logger.error({ err, uid }, 'Login failed');
      return reply.code(500).send({ error: 'Login failed' });
    }
  });

  /**
   * POST /interaction/:uid/consent
   * Process consent submission
   * Note: Must be /interaction/* (not /api/interaction/*) to match OIDC cookie paths
   * Returns JSON with redirectTo URL instead of doing redirect (to avoid CORS issues)
   */
  fastify.post<{ Params: InteractionParams; Body: ConsentBody }>('/interaction/:uid/consent', async (request, reply) => {
    const { uid } = request.params;
    const { rejectedScopes = [], rejectedClaims = [] } = request.body || {};

    try {
      logger.info({
        uid,
        rejectedScopes,
        rejectedClaims,
        cookies: request.headers.cookie,
      }, 'Processing consent');

      // Get interaction details to access session and requested scopes
      const details = await provider.interactionDetails(request.raw, reply.raw);
      const { session, params, prompt } = details;

      if (!session) {
        throw new Error('No session found for consent');
      }

      // Create a Grant to persist the consent
      const grant = new provider.Grant({
        accountId: session.accountId,
        clientId: params.client_id as string,
      });

      // Add requested scopes (minus any rejected ones)
      const requestedScopes = (prompt.details.missingOIDCScope as string[] || []);
      const approvedScopes = requestedScopes.filter((s: string) => !rejectedScopes.includes(s));
      if (approvedScopes.length > 0) {
        grant.addOIDCScope(approvedScopes.join(' '));
      }

      // Add requested claims (minus any rejected ones)
      const requestedClaims = (prompt.details.missingOIDCClaims as string[] || []);
      const approvedClaims = requestedClaims.filter((c: string) => !rejectedClaims.includes(c));
      if (approvedClaims.length > 0) {
        grant.addOIDCClaims(approvedClaims);
      }

      // If offline_access was requested and approved, add refresh token scope
      if (params.scope?.includes('offline_access') && !rejectedScopes.includes('offline_access')) {
        grant.addOIDCScope('offline_access');
      }

      // Save the grant and get grantId
      const grantId = await grant.save();

      logger.info({
        uid,
        grantId,
        accountId: session.accountId,
        clientId: params.client_id,
        approvedScopes,
        approvedClaims,
      }, 'Grant saved for consent');

      // Use interactionResult() instead of interactionFinished() to get redirect URL
      // This avoids CORS issues with cross-origin redirects in fetch()
      const redirectTo = await provider.interactionResult(request.raw, reply.raw, {
        consent: { grantId },
      }, { mergeWithLastSubmission: true });

      logger.info({ uid, grantId, redirectTo }, 'Consent granted');

      return reply.send({ redirectTo });
    } catch (err) {
      logger.error({ err, uid }, 'Consent failed');
      return reply.code(500).send({ error: 'Consent failed' });
    }
  });

  /**
   * POST /interaction/:uid/abort
   * Abort the interaction (user denied consent or cancelled login)
   * Returns access_denied error to the client
   * Returns JSON with redirectTo URL instead of doing redirect (to avoid CORS issues)
   */
  fastify.post<{ Params: InteractionParams }>('/interaction/:uid/abort', async (request, reply) => {
    const { uid } = request.params;

    try {
      logger.info({ uid }, 'User aborted interaction');

      // Use interactionResult() instead of interactionFinished() to get redirect URL
      // This avoids CORS issues with cross-origin redirects in fetch()
      const redirectTo = await provider.interactionResult(request.raw, reply.raw, {
        error: 'access_denied',
        error_description: 'End-User aborted interaction',
      }, { mergeWithLastSubmission: false });

      logger.info({ uid, redirectTo }, 'Interaction aborted, returning redirect URL');

      return reply.send({ redirectTo });
    } catch (err) {
      logger.error({ err, uid }, 'Failed to abort interaction');
      return reply.code(500).send({ error: 'Failed to abort interaction' });
    }
  });
};
