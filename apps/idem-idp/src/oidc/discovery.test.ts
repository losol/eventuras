import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { createServer } from '../server';
import { createOidcProvider } from './provider';

describe('OIDC Discovery Endpoints', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    const oidcProvider = await createOidcProvider();
    app = await createServer(oidcProvider);
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /.well-known/openid-configuration', () => {
    it('should return valid OIDC discovery metadata', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/.well-known/openid-configuration',
      });

      expect(response.statusCode).toBe(200);
      expect(response.headers['content-type']).toMatch(/json/);

      const discovery = response.json();

      // Required OIDC discovery fields
      // Note: issuer is static from config.ts (http://localhost:3200)
      // This is correct - issuer should be stable regardless of server port
      expect(discovery.issuer).toBe('http://localhost:3200');
      expect(discovery.authorization_endpoint).toMatch(/\/auth$/);
      expect(discovery.token_endpoint).toMatch(/\/token$/);
      expect(discovery.userinfo_endpoint).toMatch(/\/userinfo$/);
      expect(discovery.jwks_uri).toMatch(/\/\.well-known\/jwks\.json$/);

      // PAR support (RFC 9126)
      expect(discovery.pushed_authorization_request_endpoint).toMatch(/\/request$/);

      // Supported features
      expect(discovery.grant_types_supported).toContain('authorization_code');
      expect(discovery.grant_types_supported).toContain('refresh_token');
      expect(discovery.response_types_supported).toContain('code');

      // PKCE support
      expect(discovery.code_challenge_methods_supported).toContain('S256');

      // Scopes
      expect(discovery.scopes_supported).toContain('openid');
      expect(discovery.scopes_supported).toContain('profile');
      expect(discovery.scopes_supported).toContain('email');
      expect(discovery.scopes_supported).toContain('offline_access');
    });

    it('should advertise PAR endpoint', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/.well-known/openid-configuration',
      });

      expect(response.statusCode).toBe(200);
      expect(response.json().pushed_authorization_request_endpoint).toBeDefined();
      expect(response.json().pushed_authorization_request_endpoint).toMatch(/\/request$/);
    });

    it('should indicate PKCE support', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/.well-known/openid-configuration',
      });

      expect(response.statusCode).toBe(200);
      expect(response.json().code_challenge_methods_supported).toBeDefined();
      expect(response.json().code_challenge_methods_supported).toEqual(['S256']);
    });
  });

  describe('GET /.well-known/jwks.json', () => {
    it('should return public JWKS keys', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/.well-known/jwks.json',
      });

      expect(response.statusCode).toBe(200);
      expect(response.headers['content-type']).toMatch(/json/);

      const jwks = response.json();

      expect(jwks.keys).toBeDefined();
      expect(Array.isArray(jwks.keys)).toBe(true);
      expect(jwks.keys.length).toBeGreaterThan(0);

      const firstKey = jwks.keys[0];
      expect(firstKey.kty).toBe('RSA');
      expect(firstKey.use).toBe('sig');
      // alg field is optional in JWKS, jose library doesn't always include it
      expect(firstKey.kid).toBeDefined();
      expect(firstKey.n).toBeDefined(); // RSA modulus (public)
      expect(firstKey.e).toBe('AQAB'); // RSA exponent (standard)

      // Should NOT expose private key components
      expect(firstKey.d).toBeUndefined();
      expect(firstKey.p).toBeUndefined();
      expect(firstKey.q).toBeUndefined();
    });

    it('should only include active signing keys', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/.well-known/jwks.json',
      });

      expect(response.statusCode).toBe(200);

      const jwks = response.json();

      jwks.keys.forEach((key: any) => {
        expect(key.use).toBe('sig');
        expect(key.kty).toBe('RSA');
      });
    });
  });
});
