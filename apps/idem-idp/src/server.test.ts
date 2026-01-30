import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import type { Application } from 'express';
import { createTestServer } from './test/helpers';

describe('Public Endpoints', () => {
  let app: Application;

  beforeAll(async () => {
    app = await createTestServer();
  });

  describe('GET /', () => {
    it('should return homepage HTML', async () => {
      const response = await request(app).get('/');

      expect(response.status).toBe(200);
      expect(response.type).toBe('text/html');
      expect(response.text).toContain('idem-idp');
      expect(response.text).toContain('is running');
    });

    it('should include links to discovery and JWKS', async () => {
      const response = await request(app).get('/');

      expect(response.text).toContain('/.well-known/openid-configuration');
      expect(response.text).toContain('/.well-known/jwks.json');
      expect(response.text).toContain('/health');
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: 'ok' });
    });
  });

  describe('GET /.well-known/openid-configuration', () => {
    it('should return OIDC discovery metadata', async () => {
      const response = await request(app).get('/.well-known/openid-configuration');

      expect(response.status).toBe(200);
      expect(response.type).toBe('application/json');

      const metadata = response.body;

      // Check issuer exists (will be dynamic URL in tests)
      expect(metadata.issuer).toBeDefined();
      expect(typeof metadata.issuer).toBe('string');

      // Check endpoint paths (URLs will have dynamic port in tests)
      expect(metadata.authorization_endpoint).toContain('/auth');
      expect(metadata.token_endpoint).toContain('/token');
      expect(metadata.userinfo_endpoint).toContain('/userinfo');
      expect(metadata.jwks_uri).toContain('/.well-known/jwks.json');

      // PAR support
      expect(metadata.pushed_authorization_request_endpoint).toContain('/request');

      // Grant types and response types
      expect(metadata.grant_types_supported).toContain('authorization_code');
      expect(metadata.grant_types_supported).toContain('refresh_token');
      expect(metadata.response_types_supported).toContain('code');

      // PKCE support
      expect(metadata.code_challenge_methods_supported).toContain('S256');

      // Scopes
      expect(metadata.scopes_supported).toContain('openid');
      expect(metadata.scopes_supported).toContain('profile');
      expect(metadata.scopes_supported).toContain('email');
      expect(metadata.scopes_supported).toContain('offline_access');

      // Claims
      expect(metadata.claims_supported).toContain('sub');
      expect(metadata.claims_supported).toContain('email');
      expect(metadata.claims_supported).toContain('name');
    });
  });

  describe('GET /.well-known/jwks.json', () => {
    it('should return JWKS with public keys', async () => {
      const response = await request(app).get('/.well-known/jwks.json');

      expect(response.status).toBe(200);
      // JWKS uses application/jwk-set+json per RFC 8785
      expect(response.type).toMatch(/application\/(jwk-set\+)?json/);

      const jwks = response.body;

      expect(jwks).toHaveProperty('keys');
      expect(Array.isArray(jwks.keys)).toBe(true);
      expect(jwks.keys.length).toBeGreaterThan(0);

      // Check first key has required properties
      const firstKey = jwks.keys[0];
      expect(firstKey).toHaveProperty('kty'); // Key type (RSA)
      expect(firstKey).toHaveProperty('use', 'sig'); // Usage: signature
      expect(firstKey).toHaveProperty('kid'); // Key ID
      expect(firstKey).toHaveProperty('n'); // RSA modulus
      expect(firstKey).toHaveProperty('e'); // RSA exponent

      // Should NOT contain private key
      expect(firstKey).not.toHaveProperty('d');
      expect(firstKey).not.toHaveProperty('p');
      expect(firstKey).not.toHaveProperty('q');
    });

    it('should return keys compatible with RS256', async () => {
      const response = await request(app).get('/.well-known/jwks.json');
      const jwks = response.body;

      // Keys should be RSA type (kty: 'RSA') for RS256
      const rsaKeys = jwks.keys.filter((key: any) => key.kty === 'RSA');
      expect(rsaKeys.length).toBeGreaterThan(0);

      // Each RSA key should have use: 'sig' for signing
      rsaKeys.forEach((key: any) => {
        expect(key.use).toBe('sig');
      });
    });
  });
});
