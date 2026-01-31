import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { createServer } from '../server';
import { createOidcProvider } from './provider';
import crypto from 'crypto';
import { db } from '../db/client';
import { accounts } from '../db/schema/account';
import { eq } from 'drizzle-orm';

type InjectResponse = Awaited<ReturnType<FastifyInstance['inject']>>;

/**
 * Helper to manage cookies across requests (like supertest agent)
 */
function createCookieJar() {
  let cookies: string[] = [];

  return {
    update(response: InjectResponse) {
      const setCookie = response.headers['set-cookie'];
      if (setCookie) {
        const newCookies = Array.isArray(setCookie) ? setCookie : [setCookie];
        for (const cookie of newCookies) {
          const nameValue = cookie.split(';')[0];
          if (nameValue) {
            const name = nameValue.split('=')[0];
            if (name) {
              cookies = cookies.filter((c) => !c.startsWith(`${name}=`));
              cookies.push(nameValue);
            }
          }
        }
      }
    },
    get(): string {
      return cookies.join('; ');
    },
    clear() {
      cookies = [];
    },
  };
}

/**
 * Helper to encode form data for application/x-www-form-urlencoded
 */
function encodeForm(data: Record<string, string>): string {
  return Object.entries(data)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
}

describe('OIDC Authorization Code Flow with PKCE', () => {
  let app: FastifyInstance;
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

    testAccountId = account!.id;

    const oidcProvider = await createOidcProvider();
    app = await createServer(oidcProvider);
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
    // Cleanup test account after server closes
    await db.delete(accounts).where(eq(accounts.id, testAccountId));
  });

  function generatePKCE() {
    const verifier = crypto.randomBytes(32).toString('base64url');
    const challenge = crypto.createHash('sha256').update(verifier).digest('base64url');
    return { verifier, challenge };
  }

  describe('PKCE Enforcement', () => {
    it('should reject token exchange without code_verifier', async () => {
      const cookieJar = createCookieJar();
      const pkce = generatePKCE();

      // Start auth flow
      const queryParams = new URLSearchParams({
        client_id: 'dev_web_app',
        redirect_uri: 'http://localhost:3000/callback',
        response_type: 'code',
        scope: 'openid',
        code_challenge: pkce.challenge,
        code_challenge_method: 'S256',
      }).toString();

      const authResponse = await app.inject({
        method: 'GET',
        url: `/auth?${queryParams}`,
      });
      cookieJar.update(authResponse);

      expect(authResponse.statusCode).toBe(303);

      const uid = authResponse.headers.location?.match(/\/interaction\/([^\/]+)/)?.[1];
      expect(uid).toBeDefined();

      // Login
      const loginResponse = await app.inject({
        method: 'POST',
        url: `/interaction/${uid}/login`,
        payload: { accountId: testAccountId },
        headers: { cookie: cookieJar.get() },
      });
      cookieJar.update(loginResponse);

      expect(loginResponse.statusCode).toBe(303);

      // Follow redirect to complete authorization flow
      const resumePath = new URL(loginResponse.headers.location!).pathname;
      let resumeAuthResponse = await app.inject({
        method: 'GET',
        url: resumePath,
        headers: { cookie: cookieJar.get() },
      });
      cookieJar.update(resumeAuthResponse);

      expect(resumeAuthResponse.statusCode).toBe(303);

      // Handle consent if required
      if (resumeAuthResponse.headers.location?.includes('/interaction/')) {
        const consentUid = resumeAuthResponse.headers.location.match(/\/interaction\/([^\/]+)/)?.[1];
        const consentResponse = await app.inject({
          method: 'POST',
          url: `/interaction/${consentUid}/consent`,
          payload: { rejectedScopes: [], rejectedClaims: [] },
          headers: { cookie: cookieJar.get() },
        });
        cookieJar.update(consentResponse);

        expect(consentResponse.statusCode).toBe(303);

        const consentResumePath = new URL(consentResponse.headers.location!).pathname;
        resumeAuthResponse = await app.inject({
          method: 'GET',
          url: consentResumePath,
          headers: { cookie: cookieJar.get() },
        });
        cookieJar.update(resumeAuthResponse);

        expect(resumeAuthResponse.statusCode).toBe(303);
      }

      const code = new URL(resumeAuthResponse.headers.location!).searchParams.get('code');
      expect(code).toBeTruthy();

      // Try without code_verifier
      const tokenResponse = await app.inject({
        method: 'POST',
        url: '/token',
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
          cookie: cookieJar.get(),
        },
        payload: encodeForm({
          grant_type: 'authorization_code',
          client_id: 'dev_web_app',
          code: code!,
          redirect_uri: 'http://localhost:3000/callback',
          // Missing code_verifier
        }),
      });

      expect(tokenResponse.statusCode).toBe(400);
      expect(tokenResponse.json().error).toBe('invalid_grant');
    });

    it('should reject token exchange with wrong code_verifier', async () => {
      const cookieJar = createCookieJar();
      const pkce = generatePKCE();
      const wrongPkce = generatePKCE();

      // Start auth flow
      const queryParams = new URLSearchParams({
        client_id: 'dev_web_app',
        redirect_uri: 'http://localhost:3000/callback',
        response_type: 'code',
        scope: 'openid',
        code_challenge: pkce.challenge,
        code_challenge_method: 'S256',
      }).toString();

      const authResponse = await app.inject({
        method: 'GET',
        url: `/auth?${queryParams}`,
      });
      cookieJar.update(authResponse);

      expect(authResponse.statusCode).toBe(303);

      const uid = authResponse.headers.location?.match(/\/interaction\/([^\/]+)/)?.[1];
      expect(uid).toBeDefined();

      // Login
      const loginResponse = await app.inject({
        method: 'POST',
        url: `/interaction/${uid}/login`,
        payload: { accountId: testAccountId },
        headers: { cookie: cookieJar.get() },
      });
      cookieJar.update(loginResponse);

      expect(loginResponse.statusCode).toBe(303);

      // Follow redirect to complete authorization flow
      const resumePath = new URL(loginResponse.headers.location!).pathname;
      let resumeAuthResponse = await app.inject({
        method: 'GET',
        url: resumePath,
        headers: { cookie: cookieJar.get() },
      });
      cookieJar.update(resumeAuthResponse);

      expect(resumeAuthResponse.statusCode).toBe(303);

      // Handle consent if required
      if (resumeAuthResponse.headers.location?.includes('/interaction/')) {
        const consentUid = resumeAuthResponse.headers.location.match(/\/interaction\/([^\/]+)/)?.[1];
        const consentResponse = await app.inject({
          method: 'POST',
          url: `/interaction/${consentUid}/consent`,
          payload: { rejectedScopes: [], rejectedClaims: [] },
          headers: { cookie: cookieJar.get() },
        });
        cookieJar.update(consentResponse);

        expect(consentResponse.statusCode).toBe(303);

        const consentResumePath = new URL(consentResponse.headers.location!).pathname;
        resumeAuthResponse = await app.inject({
          method: 'GET',
          url: consentResumePath,
          headers: { cookie: cookieJar.get() },
        });
        cookieJar.update(resumeAuthResponse);

        expect(resumeAuthResponse.statusCode).toBe(303);
      }

      const code = new URL(resumeAuthResponse.headers.location!).searchParams.get('code');
      expect(code).toBeTruthy();

      // Try with wrong verifier
      const tokenResponse = await app.inject({
        method: 'POST',
        url: '/token',
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
          cookie: cookieJar.get(),
        },
        payload: encodeForm({
          grant_type: 'authorization_code',
          client_id: 'dev_web_app',
          code: code!,
          redirect_uri: 'http://localhost:3000/callback',
          code_verifier: wrongPkce.verifier, // Wrong!
        }),
      });

      expect(tokenResponse.statusCode).toBe(400);
      expect(tokenResponse.json().error).toBe('invalid_grant');
    });
  });

  describe('Security Validations', () => {
    it('should reject mismatched redirect_uri', async () => {
      const cookieJar = createCookieJar();
      const pkce = generatePKCE();

      // Start auth flow
      const queryParams = new URLSearchParams({
        client_id: 'dev_web_app',
        redirect_uri: 'http://localhost:3000/callback',
        response_type: 'code',
        scope: 'openid',
        code_challenge: pkce.challenge,
        code_challenge_method: 'S256',
      }).toString();

      const authResponse = await app.inject({
        method: 'GET',
        url: `/auth?${queryParams}`,
      });
      cookieJar.update(authResponse);

      expect(authResponse.statusCode).toBe(303);

      const uid = authResponse.headers.location?.match(/\/interaction\/([^\/]+)/)?.[1];
      expect(uid).toBeDefined();

      // Login
      const loginResponse = await app.inject({
        method: 'POST',
        url: `/interaction/${uid}/login`,
        payload: { accountId: testAccountId },
        headers: { cookie: cookieJar.get() },
      });
      cookieJar.update(loginResponse);

      expect(loginResponse.statusCode).toBe(303);

      // Follow redirect to complete authorization flow
      const resumePath = new URL(loginResponse.headers.location!).pathname;
      let resumeAuthResponse = await app.inject({
        method: 'GET',
        url: resumePath,
        headers: { cookie: cookieJar.get() },
      });
      cookieJar.update(resumeAuthResponse);

      expect(resumeAuthResponse.statusCode).toBe(303);

      // Handle consent if required
      if (resumeAuthResponse.headers.location?.includes('/interaction/')) {
        const consentUid = resumeAuthResponse.headers.location.match(/\/interaction\/([^\/]+)/)?.[1];
        const consentResponse = await app.inject({
          method: 'POST',
          url: `/interaction/${consentUid}/consent`,
          payload: { rejectedScopes: [], rejectedClaims: [] },
          headers: { cookie: cookieJar.get() },
        });
        cookieJar.update(consentResponse);

        expect(consentResponse.statusCode).toBe(303);

        const consentResumePath = new URL(consentResponse.headers.location!).pathname;
        resumeAuthResponse = await app.inject({
          method: 'GET',
          url: consentResumePath,
          headers: { cookie: cookieJar.get() },
        });
        cookieJar.update(resumeAuthResponse);

        expect(resumeAuthResponse.statusCode).toBe(303);
      }

      const code = new URL(resumeAuthResponse.headers.location!).searchParams.get('code');
      expect(code).toBeTruthy();

      // Try with different redirect_uri
      const tokenResponse = await app.inject({
        method: 'POST',
        url: '/token',
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
          cookie: cookieJar.get(),
        },
        payload: encodeForm({
          grant_type: 'authorization_code',
          client_id: 'dev_web_app',
          code: code!,
          redirect_uri: 'http://evil.com/callback', // Different!
          code_verifier: pkce.verifier,
        }),
      });

      expect(tokenResponse.statusCode).toBe(400);
      expect(tokenResponse.json().error).toBe('invalid_grant');
    });
  });
});
