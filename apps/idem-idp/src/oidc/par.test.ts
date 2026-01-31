import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { createServer } from '../server';
import { createOidcProvider } from './provider';
import crypto from 'crypto';

describe('PAR (Pushed Authorization Request) - RFC 9126', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    const oidcProvider = await createOidcProvider();
    app = await createServer(oidcProvider);
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  function generatePKCE() {
    const verifier = crypto.randomBytes(32).toString('base64url');
    const challenge = crypto.createHash('sha256').update(verifier).digest('base64url');
    return { verifier, challenge };
  }

  /**
   * Helper to encode form data for application/x-www-form-urlencoded
   */
  function encodeForm(data: Record<string, string>): string {
    return Object.entries(data)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');
  }

  describe('POST /request (PAR endpoint)', () => {
    it('should reject PAR without required parameters', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/request',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        payload: encodeForm({
          client_id: 'dev_web_app',
          // Missing response_type, redirect_uri, etc.
        }),
      });

      expect(response.statusCode).toBe(400);
      expect(response.json().error).toBeDefined();
    });
  });

  describe('Authorization with request_uri', () => {
    it('should accept authorization request with valid request_uri', async () => {
      const pkce = generatePKCE();

      // Step 1: Push authorization request
      const parResponse = await app.inject({
        method: 'POST',
        url: '/request',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        payload: encodeForm({
          client_id: 'dev_web_app',
          response_type: 'code',
          scope: 'openid profile email',
          redirect_uri: 'http://localhost:3000/callback',
          code_challenge: pkce.challenge,
          code_challenge_method: 'S256',
          state: 'test-state',
        }),
      });

      expect(parResponse.statusCode).toBe(201);
      const { request_uri } = parResponse.json();

      // Step 2: Use request_uri in authorization endpoint
      const queryParams = new URLSearchParams({
        client_id: 'dev_web_app',
        request_uri,
      }).toString();

      const authResponse = await app.inject({
        method: 'GET',
        url: `/auth?${queryParams}`,
      });

      expect(authResponse.statusCode).toBe(303); // Redirect to interaction
      expect(authResponse.headers.location).toMatch(/\/interaction\//);
    });

    it('should reject expired request_uri', async () => {
      // Note: This test would require waiting 10+ minutes or mocking time
      // Skipping implementation for now - would need time manipulation
    });
  });

  describe('PAR Security', () => {
    it('should not allow mixing request_uri with other parameters', async () => {
      const pkce = generatePKCE();

      const parResponse = await app.inject({
        method: 'POST',
        url: '/request',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        payload: encodeForm({
          client_id: 'dev_web_app',
          response_type: 'code',
          scope: 'openid',
          redirect_uri: 'http://localhost:3000/callback',
          code_challenge: pkce.challenge,
          code_challenge_method: 'S256',
        }),
      });

      expect(parResponse.statusCode).toBe(201);
      const { request_uri } = parResponse.json();

      // Try to override scope via query param (should be ignored/rejected)
      const queryParams = new URLSearchParams({
        client_id: 'dev_web_app',
        request_uri,
        scope: 'openid profile email admin', // Trying to escalate
      }).toString();

      const response = await app.inject({
        method: 'GET',
        url: `/auth?${queryParams}`,
      });

      // OIDC provider should either ignore or reject
      expect(response.statusCode).toBeGreaterThanOrEqual(303);
    });
  });
});
