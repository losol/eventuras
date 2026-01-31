import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { createTestServer } from './test/helpers';

describe('Public Endpoints', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await createTestServer();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /', () => {
    it('should return SPA HTML', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/',
      });

      expect(response.statusCode).toBe(200);
      expect(response.headers['content-type']).toContain('text/html');
      // SPA serves index.html with React mount point
      expect(response.payload).toContain('<div id="root">');
      expect(response.payload).toContain('Idem IdP');
    });

    it('should include script bundle for React SPA', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/',
      });

      // SPA loads JavaScript bundle
      expect(response.payload).toContain('<script type="module"');
      expect(response.payload).toContain('/assets/');
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health',
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({ status: 'ok' });
    });
  });

  describe('GET /.well-known/openid-configuration', () => {
    it('should return OIDC discovery metadata', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/.well-known/openid-configuration',
      });

      expect(response.statusCode).toBe(200);
      expect(response.headers['content-type']).toContain('application/json');

      const metadata = response.json();

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
      const response = await app.inject({
        method: 'GET',
        url: '/.well-known/jwks.json',
      });

      expect(response.statusCode).toBe(200);
      // JWKS uses application/jwk-set+json per RFC 8785
      expect(response.headers['content-type']).toMatch(/application\/(jwk-set\+)?json/);

      const jwks = response.json();

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
      const response = await app.inject({
        method: 'GET',
        url: '/.well-known/jwks.json',
      });

      const jwks = response.json();

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
