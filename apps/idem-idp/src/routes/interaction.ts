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
      logger.info({ uid }, 'Processing login');

      // TODO: In production, verify credentials here
      // For dev: accept any accountId (from seed data or test)

      // Use interactionFinished() for server-side redirect (302)
      // This preserves all OIDC session cookies correctly
      await provider.interactionFinished(request.raw, reply.raw, {
        login: { accountId },
      }, { mergeWithLastSubmission: false });

      logger.info({ uid }, 'Login successful, redirecting');

      // interactionFinished() handles the redirect automatically
      // No need to return anything - reply.raw is already sent
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
      logger.info({ uid }, 'Processing consent');

      // Get interaction details to access session and requested scopes
      const details = await provider.interactionDetails(request.raw, reply.raw);
      const { session, params, prompt } = details;

      if (!session) {
        throw new Error('No session found for consent');
      }

      // Prepare consent data based on prompt details

      // Create a Grant to persist the consent
      const grant = new provider.Grant({
        accountId: session.accountId,
        clientId: params.client_id as string,
      });

      // Get requested scopes from params (what the client initially requested)
      const allRequestedScopes = (params.scope as string || '').split(' ').filter(Boolean);

      // Filter out rejected scopes
      const approvedScopes = allRequestedScopes.filter((s: string) => !rejectedScopes.includes(s));

      // Check if scopes are requested for a resource identifier
      const missingResourceScopes = (prompt.details as any)?.missingResourceScopes;
      const missingOIDCScope = (prompt.details as any)?.missingOIDCScope;

      // Handle resource scopes (API-specific scopes)
      if (missingResourceScopes && typeof missingResourceScopes === 'object') {
        // Add scopes for each resource
        for (const [resource, scopes] of Object.entries(missingResourceScopes)) {
          const resourceScopes = (scopes as string[]).filter((s: string) => !rejectedScopes.includes(s));
          if (resourceScopes.length > 0) {
            grant.addResourceScope(resource, resourceScopes.join(' '));
          }
        }
      }

      // Handle OIDC scopes (openid, profile, email, offline_access)
      // These might be in missingOIDCScope OR in the regular approved scopes
      const oidcScopes = missingOIDCScope || approvedScopes;
      const approvedOIDCScopes = Array.isArray(oidcScopes)
        ? oidcScopes.filter((s: string) => !rejectedScopes.includes(s))
        : oidcScopes.split(' ').filter((s: string) => !rejectedScopes.includes(s) && s);

      if (approvedOIDCScopes.length > 0) {
        grant.addOIDCScope(approvedOIDCScopes.join(' '));
      }

      // Handle claims - check if there are specific missing OIDC claims requested
      const missingOIDCClaims = (prompt.details as any)?.missingOIDCClaims;

      let claimsToGrant: string[] = [];

      if (missingOIDCClaims && Array.isArray(missingOIDCClaims)) {
        // Use the specific claims requested by oidc-provider
        claimsToGrant = missingOIDCClaims.filter((c: string) => !rejectedClaims.includes(c));
      } else {
        // Build standard claims from approved scopes
        const standardClaims = ['sub'];
        if (approvedOIDCScopes.includes('profile')) {
          standardClaims.push('name', 'given_name', 'family_name', 'picture', 'locale', 'roles');
        }
        if (approvedOIDCScopes.includes('email')) {
          standardClaims.push('email', 'email_verified');
        }
        claimsToGrant = standardClaims.filter((c: string) => !rejectedClaims.includes(c));
      }

      if (claimsToGrant.length > 0) {
        grant.addOIDCClaims(claimsToGrant);
      }

      // Save the grant and get grantId
      const grantId = await grant.save();

      logger.info({
        uid,
        clientId: params.client_id,
      }, 'Grant saved for consent');

      // Use interactionFinished() for server-side redirect (302)
      // This preserves all OIDC session cookies correctly
      await provider.interactionFinished(request.raw, reply.raw, {
        consent: { grantId },
      }, { mergeWithLastSubmission: true });

      logger.info({ uid }, 'Consent granted, redirecting');

      // interactionFinished() handles the redirect automatically
      // No need to return anything - reply.raw is already sent
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

      // Use interactionFinished() for server-side redirect (302)
      // This preserves all OIDC session cookies correctly
      await provider.interactionFinished(request.raw, reply.raw, {
        error: 'access_denied',
        error_description: 'End-User aborted interaction',
      }, { mergeWithLastSubmission: false });

      logger.info({ uid }, 'Interaction aborted, redirecting with error');

      // interactionFinished() handles the redirect automatically
      // No need to return anything - reply.raw is already sent
    } catch (err) {
      logger.error({ err, uid }, 'Failed to abort interaction');
      return reply.code(500).send({ error: 'Failed to abort interaction' });
    }
  });
};
