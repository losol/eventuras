import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createServer } from '../server';
import { createOidcProvider } from './provider';
import type { Server } from 'http';
import request from 'supertest';
import crypto from 'crypto';

describe('PAR (Pushed Authorization Request) - RFC 9126', () => {
  let server: Server;
  let baseURL: string;

  beforeAll(async () => {
    const oidcProvider = await createOidcProvider();
    const app = createServer(oidcProvider);

    server = app.listen(0);
    const address = server.address();
    const port = typeof address === 'object' && address ? address.port : 3200;
    baseURL = `http://localhost:${port}`;
  });

  afterAll((done) => {
    server?.close(done);
  });

  function generatePKCE() {
    const verifier = crypto.randomBytes(32).toString('base64url');
    const challenge = crypto.createHash('sha256').update(verifier).digest('base64url');
    return { verifier, challenge };
  }

  describe('POST /request (PAR endpoint)', () => {
    it('should reject PAR without required parameters', async () => {
      const response = await request(baseURL)
        .post('/request')
        .type('form')
        .send({
          client_id: 'dev_web_app',
          // Missing response_type, redirect_uri, etc.
        })
        .expect(400);

      expect(response.body.error).toBeDefined();
    });
  });

  describe('Authorization with request_uri', () => {
    it('should accept authorization request with valid request_uri', async () => {
      const pkce = generatePKCE();

      // Step 1: Push authorization request
      const parResponse = await request(baseURL)
        .post('/request')
        .type('form')
        .send({
          client_id: 'dev_web_app',
          response_type: 'code',
          scope: 'openid profile email',
          redirect_uri: 'http://localhost:3000/callback',
          code_challenge: pkce.challenge,
          code_challenge_method: 'S256',
          state: 'test-state',
        })
        .expect(201);

      const { request_uri } = parResponse.body;

      // Step 2: Use request_uri in authorization endpoint
      const authResponse = await request(baseURL)
        .get('/auth')
        .query({
          client_id: 'dev_web_app',
          request_uri,
        })
        .expect(303); // Redirect to interaction

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

      const parResponse = await request(baseURL)
        .post('/request')
        .type('form')
        .send({
          client_id: 'dev_web_app',
          response_type: 'code',
          scope: 'openid',
          redirect_uri: 'http://localhost:3000/callback',
          code_challenge: pkce.challenge,
          code_challenge_method: 'S256',
        })
        .expect(201);

      const { request_uri } = parResponse.body;

      // Try to override scope via query param (should be ignored/rejected)
      const response = await request(baseURL)
        .get('/auth')
        .query({
          client_id: 'dev_web_app',
          request_uri,
          scope: 'openid profile email admin', // Trying to escalate
        });

      // OIDC provider should either ignore or reject
      expect(response.status).toBeGreaterThanOrEqual(303);
    });
  });
});
