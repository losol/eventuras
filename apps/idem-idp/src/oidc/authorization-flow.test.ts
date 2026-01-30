import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createServer } from '../server';
import { createOidcProvider } from './provider';
import type { Server } from 'http';
import request from 'supertest';
import crypto from 'crypto';
import { db } from '../db/client';
import { accounts } from '../db/schema/account';
import { eq } from 'drizzle-orm';

describe('OIDC Authorization Code Flow with PKCE', () => {
  let server: Server;
  let testAccountId: string;

  beforeAll(async () => {
    // Clean up any existing test account first
    await db.delete(accounts).where(eq(accounts.primaryEmail, 'test-oidc-flow@example.com'));

    // Create test account BEFORE starting server
    const [account] = await db.insert(accounts).values({
      primaryEmail: 'test-oidc-flow@example.com',
      displayName: 'Test Flow User',
      givenName: 'Test',
      familyName: 'Flow',
      active: true,
    }).returning();

    testAccountId = account.id;

    const oidcProvider = await createOidcProvider();
    const app = createServer(oidcProvider);

    server = app.listen(0);
  });

  afterAll(async (done) => {
    server?.close(() => {
      // Cleanup test account after server closes
      db.delete(accounts).where(eq(accounts.id, testAccountId)).then(() => done());
    });
  });

  function generatePKCE() {
    const verifier = crypto.randomBytes(32).toString('base64url');
    const challenge = crypto.createHash('sha256').update(verifier).digest('base64url');
    return { verifier, challenge };
  }

  /**
   * Helper to perform auth flow with cookie maintenance
   * Returns an agent that maintains session cookies
   */
  function createAgent() {
    return request.agent(server);
  }

  describe('PKCE Enforcement', () => {
    it('should reject token exchange without code_verifier', async () => {
      const agent = createAgent();
      const pkce = generatePKCE();

      const authResponse = await agent
        .get('/auth')
        .query({
          client_id: 'dev_web_app',
          redirect_uri: 'http://localhost:3000/callback',
          response_type: 'code',
          scope: 'openid',
          code_challenge: pkce.challenge,
          code_challenge_method: 'S256',
        })
        .expect(303);

      const uid = authResponse.headers.location?.match(/\/interaction\/([^\/]+)/)?.[1];
      expect(uid).toBeDefined();

      const loginResponse = await agent
        .post(`/interaction/${uid}/login`)
        .send({ accountId: testAccountId })
        .expect(303);

      // Follow redirect to complete authorization flow
      const resumePath = new URL(loginResponse.headers.location!).pathname;
      let resumeAuthResponse = await agent
        .get(resumePath)
        .expect(303);

      // Handle consent if required
      if (resumeAuthResponse.headers.location?.includes('/interaction/')) {
        const consentUid = resumeAuthResponse.headers.location.match(/\/interaction\/([^\/]+)/)?.[1];
        const consentResponse = await agent
          .post(`/interaction/${consentUid}/consent`)
          .send({ rejectedScopes: [], rejectedClaims: [] })
          .expect(303);
        const consentResumePath = new URL(consentResponse.headers.location!).pathname;
        resumeAuthResponse = await agent.get(consentResumePath).expect(303);
      }

      const code = new URL(resumeAuthResponse.headers.location!).searchParams.get('code');

      // Try without code_verifier
      const response = await agent
        .post('/token')
        .type('form')
        .send({
          grant_type: 'authorization_code',
          client_id: 'dev_web_app',
          code,
          redirect_uri: 'http://localhost:3000/callback',
          // Missing code_verifier
        })
        .expect(400);

      expect(response.body.error).toBe('invalid_grant');
    });

    it('should reject token exchange with wrong code_verifier', async () => {
      const agent = createAgent();
      const pkce = generatePKCE();
      const wrongPkce = generatePKCE();

      const authResponse = await agent
        .get('/auth')
        .query({
          client_id: 'dev_web_app',
          redirect_uri: 'http://localhost:3000/callback',
          response_type: 'code',
          scope: 'openid',
          code_challenge: pkce.challenge,
          code_challenge_method: 'S256',
        })
        .expect(303);

      const uid = authResponse.headers.location?.match(/\/interaction\/([^\/]+)/)?.[1];
      expect(uid).toBeDefined();

      const loginResponse = await agent
        .post(`/interaction/${uid}/login`)
        .send({ accountId: testAccountId })
        .expect(303);

      // Follow redirect to complete authorization flow
      const resumePath = new URL(loginResponse.headers.location!).pathname;
      let resumeAuthResponse = await agent
        .get(resumePath)
        .expect(303);

      // Handle consent if required
      if (resumeAuthResponse.headers.location?.includes('/interaction/')) {
        const consentUid = resumeAuthResponse.headers.location.match(/\/interaction\/([^\/]+)/)?.[1];
        const consentResponse = await agent
          .post(`/interaction/${consentUid}/consent`)
          .send({ rejectedScopes: [], rejectedClaims: [] })
          .expect(303);
        const consentResumePath = new URL(consentResponse.headers.location!).pathname;
        resumeAuthResponse = await agent.get(consentResumePath).expect(303);
      }

      const code = new URL(resumeAuthResponse.headers.location!).searchParams.get('code');

      // Try with wrong verifier
      const response = await agent
        .post('/token')
        .type('form')
        .send({
          grant_type: 'authorization_code',
          client_id: 'dev_web_app',
          code,
          redirect_uri: 'http://localhost:3000/callback',
          code_verifier: wrongPkce.verifier, // Wrong!
        })
        .expect(400);

      expect(response.body.error).toBe('invalid_grant');
    });
  });

  describe('Security Validations', () => {
    it('should reject mismatched redirect_uri', async () => {
      const agent = createAgent();
      const pkce = generatePKCE();

      const authResponse = await agent
        .get('/auth')
        .query({
          client_id: 'dev_web_app',
          redirect_uri: 'http://localhost:3000/callback',
          response_type: 'code',
          scope: 'openid',
          code_challenge: pkce.challenge,
          code_challenge_method: 'S256',
        })
        .expect(303);

      const uid = authResponse.headers.location?.match(/\/interaction\/([^\/]+)/)?.[1];
      expect(uid).toBeDefined();

      const loginResponse = await agent
        .post(`/interaction/${uid}/login`)
        .send({ accountId: testAccountId })
        .expect(303);

      // Follow redirect to complete authorization flow
      const resumePath = new URL(loginResponse.headers.location!).pathname;
      let resumeAuthResponse = await agent
        .get(resumePath)
        .expect(303);

      // Handle consent if required
      if (resumeAuthResponse.headers.location?.includes('/interaction/')) {
        const consentUid = resumeAuthResponse.headers.location.match(/\/interaction\/([^\/]+)/)?.[1];
        const consentResponse = await agent
          .post(`/interaction/${consentUid}/consent`)
          .send({ rejectedScopes: [], rejectedClaims: [] })
          .expect(303);
        const consentResumePath = new URL(consentResponse.headers.location!).pathname;
        resumeAuthResponse = await agent.get(consentResumePath).expect(303);
      }

      const code = new URL(resumeAuthResponse.headers.location!).searchParams.get('code');

      // Try with different redirect_uri
      const response = await agent
        .post('/token')
        .type('form')
        .send({
          grant_type: 'authorization_code',
          client_id: 'dev_web_app',
          code,
          redirect_uri: 'http://evil.com/callback', // Different!
          code_verifier: pkce.verifier,
        })
        .expect(400);

      expect(response.body.error).toBe('invalid_grant');
    });
  });
});
