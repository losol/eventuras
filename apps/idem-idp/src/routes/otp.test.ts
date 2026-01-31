import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { createServer } from '../server';
import { Mailer } from '@eventuras/mailer';
import { db } from '../db/client';
import { otpCodes, accounts, otpRateLimits } from '../db/schema';
import { eq, or } from 'drizzle-orm';

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
        // Parse and store cookies (simplified - just keep the cookie name=value part)
        for (const cookie of newCookies) {
          const nameValue = cookie.split(';')[0];
          if (nameValue) {
            const name = nameValue.split('=')[0];
            if (name) {
              // Replace existing cookie or add new one
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

describe.sequential('OTP API Routes', () => {
  let app: FastifyInstance;
  let capturedOtpCode: string | null = null;
  let mockMailer: Mailer;

  beforeAll(async () => {
    // Create a mock mailer that captures OTP codes instead of sending emails
    mockMailer = {
      sendEmail: vi.fn(async (options) => {
        // Extract OTP code from email HTML
        const codeMatch = options.html.match(/(\d{6})/);
        if (codeMatch) {
          capturedOtpCode = codeMatch[1];
        }
      }),
      verify: vi.fn(async () => true),
      close: vi.fn(async () => {}),
    } as unknown as Mailer;

    // Create test server with mock mailer (no OIDC provider needed)
    app = await createServer(undefined, mockMailer);
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(async () => {
    // Clean up test data after each test
    capturedOtpCode = null;

    // Cleanup in correct order (delete children first, then parents)
    // Delete OTP codes and rate limits first (they reference accounts)
    await db.delete(otpCodes).where(
      or(
        eq(otpCodes.recipient, 'test@example.com'),
        eq(otpCodes.recipient, 'newuser@example.com'),
        eq(otpCodes.recipient, 'ratelimit@example.com'),
        eq(otpCodes.recipient, 'fullflow@example.com'),
        eq(otpCodes.recipient, 'nonexistent@example.com')
      )
    );

    await db.delete(otpRateLimits).where(
      or(
        eq(otpRateLimits.recipient, 'test@example.com'),
        eq(otpRateLimits.recipient, 'newuser@example.com'),
        eq(otpRateLimits.recipient, 'ratelimit@example.com'),
        eq(otpRateLimits.recipient, 'fullflow@example.com'),
        eq(otpRateLimits.recipient, 'nonexistent@example.com')
      )
    );

    // Then delete accounts
    await db.delete(accounts).where(
      or(
        eq(accounts.primaryEmail, 'test@example.com'),
        eq(accounts.primaryEmail, 'newuser@example.com'),
        eq(accounts.primaryEmail, 'ratelimit@example.com'),
        eq(accounts.primaryEmail, 'fullflow@example.com'),
        eq(accounts.primaryEmail, 'nonexistent@example.com')
      )
    );
  });

  describe('POST /api/otp/request', () => {
    it('should request OTP code for valid email', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/otp/request',
        payload: { email: 'test@example.com' },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({
        success: true,
        message: 'If this email is registered, you will receive a login code shortly.',
      });

      // Verify mailer was called
      expect(mockMailer.sendEmail).toHaveBeenCalledOnce();
      expect(capturedOtpCode).toMatch(/^\d{6}$/);
    });

    it('should return 400 for missing email', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/otp/request',
        payload: {},
      });

      expect(response.statusCode).toBe(400);
      expect(response.json()).toEqual({
        error: 'Invalid request',
        message: 'Email is required',
      });
    });

    it('should return 400 for invalid email format', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/otp/request',
        payload: { email: 'not-an-email' },
      });

      expect(response.statusCode).toBe(400);
      expect(response.json()).toEqual({
        error: 'Invalid request',
        message: 'Invalid email format',
      });
    });

    it('should not leak whether account exists', async () => {
      // Request for non-existent account
      const response1 = await app.inject({
        method: 'POST',
        url: '/api/otp/request',
        payload: { email: 'nonexistent@example.com' },
      });

      expect(response1.statusCode).toBe(200);

      // Request for existing account
      const response2 = await app.inject({
        method: 'POST',
        url: '/api/otp/request',
        payload: { email: 'test@example.com' },
      });

      expect(response2.statusCode).toBe(200);

      // Both should return the same message
      expect(response1.json().message).toBe(response2.json().message);

      // Neither should include expiresAt (security fix)
      expect(response1.json().expiresAt).toBeUndefined();
      expect(response2.json().expiresAt).toBeUndefined();
    });

    it('should create account if it does not exist', async () => {
      const newEmail = 'newuser@example.com';

      // Verify account doesn't exist
      const accountBefore = await db.query.accounts.findFirst({
        where: eq(accounts.primaryEmail, newEmail),
      });
      expect(accountBefore).toBeUndefined();

      // Request OTP
      const response = await app.inject({
        method: 'POST',
        url: '/api/otp/request',
        payload: { email: newEmail },
      });

      expect(response.statusCode).toBe(200);

      // Verify account was created
      const accountAfter = await db.query.accounts.findFirst({
        where: eq(accounts.primaryEmail, newEmail),
      });
      expect(accountAfter).toBeDefined();
      expect(accountAfter?.primaryEmail).toBe(newEmail);
      expect(accountAfter?.active).toBe(true);

      // Cleanup
      if (accountAfter) {
        await db.delete(otpCodes).where(eq(otpCodes.recipient, newEmail));
        await db.delete(accounts).where(eq(accounts.id, accountAfter.id));
      }
    });

    it('should enforce rate limiting', async () => {
      const email = 'ratelimit@example.com';

      // First 3 requests should succeed (rate limit is 3 per 15 minutes)
      for (let i = 0; i < 3; i++) {
        const response = await app.inject({
          method: 'POST',
          url: '/api/otp/request',
          payload: { email },
        });
        expect(response.statusCode).toBe(200);
      }

      // 4th request should be rate limited
      const response = await app.inject({
        method: 'POST',
        url: '/api/otp/request',
        payload: { email },
      });

      expect(response.statusCode).toBe(429);
      expect(response.json().error).toBe('Too many requests');
      expect(response.json().message).toContain('Too many OTP requests');

      // Cleanup
      const account = await db.query.accounts.findFirst({
        where: eq(accounts.primaryEmail, email),
      });
      if (account) {
        await db.delete(otpCodes).where(eq(otpCodes.recipient, email));
        await db.delete(accounts).where(eq(accounts.id, account.id));
      }
    });
  });

  describe('POST /api/otp/verify', () => {
    it('should verify valid OTP code', async () => {
      const cookieJar = createCookieJar();

      // Request OTP
      const requestResponse = await app.inject({
        method: 'POST',
        url: '/api/otp/request',
        payload: { email: 'test@example.com' },
      });
      cookieJar.update(requestResponse);

      expect(requestResponse.statusCode).toBe(200);
      expect(capturedOtpCode).toBeTruthy();

      // Verify OTP
      const verifyResponse = await app.inject({
        method: 'POST',
        url: '/api/otp/verify',
        payload: {
          email: 'test@example.com',
          code: capturedOtpCode,
        },
        headers: { cookie: cookieJar.get() },
      });
      cookieJar.update(verifyResponse);

      expect(verifyResponse.statusCode).toBe(200);
      expect(verifyResponse.json().success).toBe(true);
      expect(verifyResponse.json().accountId).toBeDefined();

      // Verify session was created
      const sessionResponse = await app.inject({
        method: 'GET',
        url: '/api/otp/session',
        headers: { cookie: cookieJar.get() },
      });

      expect(sessionResponse.statusCode).toBe(200);
      expect(sessionResponse.json().authenticated).toBe(true);
      expect(sessionResponse.json().account).toBeDefined();
      expect(sessionResponse.json().account.email).toBe('test@example.com');
    });

    it('should return 400 for missing email', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/otp/verify',
        payload: { code: '123456' },
      });

      expect(response.statusCode).toBe(400);
      expect(response.json().error).toBe('Invalid request');
      expect(response.json().message).toBe('Email is required');
    });

    it('should return 400 for missing code', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/otp/verify',
        payload: { email: 'test@example.com' },
      });

      expect(response.statusCode).toBe(400);
      expect(response.json().error).toBe('Invalid request');
      expect(response.json().message).toBe('Code is required');
    });

    it('should return 401 for invalid code', async () => {
      // Request OTP
      const requestResponse = await app.inject({
        method: 'POST',
        url: '/api/otp/request',
        payload: { email: 'test@example.com' },
      });

      expect(requestResponse.statusCode).toBe(200);

      // Try to verify with wrong code
      const response = await app.inject({
        method: 'POST',
        url: '/api/otp/verify',
        payload: {
          email: 'test@example.com',
          code: '000000', // Wrong code
        },
      });

      expect(response.statusCode).toBe(401);
      expect(response.json().error).toBe('INVALID_CODE');
    });

    it('should return 401 for non-existent email', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/otp/verify',
        payload: {
          email: 'nonexistent@example.com',
          code: '123456',
        },
      });

      expect(response.statusCode).toBe(401);
      expect(response.json().error).toBe('NOT_FOUND');
    });

    it('should not allow code reuse', async () => {
      // Request OTP
      const requestResponse = await app.inject({
        method: 'POST',
        url: '/api/otp/request',
        payload: { email: 'test@example.com' },
      });

      expect(requestResponse.statusCode).toBe(200);
      expect(capturedOtpCode).toBeTruthy();

      // First verification should succeed
      const firstVerify = await app.inject({
        method: 'POST',
        url: '/api/otp/verify',
        payload: {
          email: 'test@example.com',
          code: capturedOtpCode,
        },
      });

      expect(firstVerify.statusCode).toBe(200);

      // Second verification with same code should fail
      const secondVerify = await app.inject({
        method: 'POST',
        url: '/api/otp/verify',
        payload: {
          email: 'test@example.com',
          code: capturedOtpCode,
        },
      });

      expect(secondVerify.statusCode).toBe(401);
      expect(secondVerify.json().error).toBe('NOT_FOUND');
    });
  });

  describe('GET /api/otp/session', () => {
    it('should return session info for authenticated user', async () => {
      const cookieJar = createCookieJar();

      // Request OTP
      const requestResponse = await app.inject({
        method: 'POST',
        url: '/api/otp/request',
        payload: { email: 'test@example.com' },
      });
      cookieJar.update(requestResponse);

      expect(requestResponse.statusCode).toBe(200);

      // Verify OTP
      const verifyResponse = await app.inject({
        method: 'POST',
        url: '/api/otp/verify',
        payload: {
          email: 'test@example.com',
          code: capturedOtpCode,
        },
        headers: { cookie: cookieJar.get() },
      });
      cookieJar.update(verifyResponse);

      expect(verifyResponse.statusCode).toBe(200);

      // Check session
      const sessionResponse = await app.inject({
        method: 'GET',
        url: '/api/otp/session',
        headers: { cookie: cookieJar.get() },
      });

      expect(sessionResponse.statusCode).toBe(200);
      expect(sessionResponse.json().authenticated).toBe(true);
      expect(sessionResponse.json().account).toBeDefined();
      expect(sessionResponse.json().account.email).toBe('test@example.com');
    });

    it('should return unauthenticated for no session', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/otp/session',
      });

      expect(response.statusCode).toBe(200);
      expect(response.json().authenticated).toBe(false);
      expect(response.json().account).toBeNull();
    });
  });

  describe('POST /api/otp/logout', () => {
    it('should destroy session on logout', async () => {
      const cookieJar = createCookieJar();

      // Request OTP
      const requestResponse = await app.inject({
        method: 'POST',
        url: '/api/otp/request',
        payload: { email: 'test@example.com' },
      });
      cookieJar.update(requestResponse);

      // Verify OTP
      const verifyResponse = await app.inject({
        method: 'POST',
        url: '/api/otp/verify',
        payload: {
          email: 'test@example.com',
          code: capturedOtpCode,
        },
        headers: { cookie: cookieJar.get() },
      });
      cookieJar.update(verifyResponse);

      // Verify session exists
      const sessionBefore = await app.inject({
        method: 'GET',
        url: '/api/otp/session',
        headers: { cookie: cookieJar.get() },
      });
      expect(sessionBefore.json().authenticated).toBe(true);

      // Logout
      const logoutResponse = await app.inject({
        method: 'POST',
        url: '/api/otp/logout',
        headers: { cookie: cookieJar.get() },
      });
      cookieJar.update(logoutResponse);

      expect(logoutResponse.statusCode).toBe(200);

      // Verify session is destroyed
      const sessionAfter = await app.inject({
        method: 'GET',
        url: '/api/otp/session',
        headers: { cookie: cookieJar.get() },
      });
      expect(sessionAfter.json().authenticated).toBe(false);
    });

    it('should handle logout without session', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/otp/logout',
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({
        success: true,
        message: 'Logged out successfully',
      });
    });
  });

  describe('Full OTP Flow', () => {
    it('should complete full authentication flow', async () => {
      const email = 'fullflow@example.com';
      const cookieJar = createCookieJar();

      // Step 1: Request OTP
      const requestResponse = await app.inject({
        method: 'POST',
        url: '/api/otp/request',
        payload: { email },
      });
      cookieJar.update(requestResponse);

      expect(requestResponse.statusCode).toBe(200);
      expect(requestResponse.json().success).toBe(true);
      expect(capturedOtpCode).toMatch(/^\d{6}$/);

      // Step 2: Verify session is not authenticated yet
      const sessionBefore = await app.inject({
        method: 'GET',
        url: '/api/otp/session',
        headers: { cookie: cookieJar.get() },
      });
      expect(sessionBefore.json().authenticated).toBe(false);

      // Step 3: Verify OTP code
      const verifyResponse = await app.inject({
        method: 'POST',
        url: '/api/otp/verify',
        payload: { email, code: capturedOtpCode },
        headers: { cookie: cookieJar.get() },
      });
      cookieJar.update(verifyResponse);

      expect(verifyResponse.statusCode).toBe(200);
      expect(verifyResponse.json().success).toBe(true);

      // Step 4: Verify session is now authenticated
      const sessionAfter = await app.inject({
        method: 'GET',
        url: '/api/otp/session',
        headers: { cookie: cookieJar.get() },
      });
      expect(sessionAfter.json().authenticated).toBe(true);
      expect(sessionAfter.json().account.email).toBe(email);

      // Step 5: Logout
      const logoutResponse = await app.inject({
        method: 'POST',
        url: '/api/otp/logout',
        headers: { cookie: cookieJar.get() },
      });
      cookieJar.update(logoutResponse);

      expect(logoutResponse.statusCode).toBe(200);

      // Step 6: Verify session is destroyed
      const sessionFinal = await app.inject({
        method: 'GET',
        url: '/api/otp/session',
        headers: { cookie: cookieJar.get() },
      });
      expect(sessionFinal.json().authenticated).toBe(false);

      // Cleanup
      const account = await db.query.accounts.findFirst({
        where: eq(accounts.primaryEmail, email),
      });
      if (account) {
        await db.delete(otpCodes).where(eq(otpCodes.recipient, email));
        await db.delete(accounts).where(eq(accounts.id, account.id));
      }
    });
  });
});
