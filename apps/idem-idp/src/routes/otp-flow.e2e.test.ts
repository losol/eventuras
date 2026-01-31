/**
 * End-to-end OTP Authentication Flow Test
 *
 * This test demonstrates the complete happy-path OTP flow from
 * email request → code verification → session → logout.
 *
 * Edge cases and error handling are tested in unit tests.
 */
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { createServer } from '../server';
import { Mailer } from '@eventuras/mailer';
import { db } from '../db/client';
import { otpCodes, accounts, otpRateLimits } from '../db/schema';
import { eq } from 'drizzle-orm';

type InjectResponse = Awaited<ReturnType<FastifyInstance['inject']>>;

/**
 * Helper to manage cookies across requests
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
  };
}

describe('OTP E2E Flow', () => {
  let app: FastifyInstance;
  let capturedOtpCode: string | null = null;
  const testEmail = 'e2e-test@example.com';

  beforeAll(async () => {
    // Mock mailer to capture OTP codes
    const mockMailer: Mailer = {
      sendEmail: vi.fn(async (options) => {
        const codeMatch = options.html.match(/(\d{6})/);
        if (codeMatch) {
          capturedOtpCode = codeMatch[1];
        }
      }),
      verify: vi.fn(async () => true),
      close: vi.fn(async () => {}),
    } as unknown as Mailer;

    app = await createServer(undefined, mockMailer);
    await app.ready();

    // Cleanup any existing test data
    await db.delete(otpCodes).where(eq(otpCodes.recipient, testEmail));
    await db.delete(otpRateLimits).where(eq(otpRateLimits.recipient, testEmail));
    await db.delete(accounts).where(eq(accounts.primaryEmail, testEmail));
  });

  afterAll(async () => {
    // Final cleanup
    await db.delete(otpCodes).where(eq(otpCodes.recipient, testEmail));
    await db.delete(otpRateLimits).where(eq(otpRateLimits.recipient, testEmail));
    await db.delete(accounts).where(eq(accounts.primaryEmail, testEmail));
    await app.close();
  });

  it('should complete full OTP authentication flow', async () => {
    const cookieJar = createCookieJar();

    // Step 1: Request OTP code
    const requestResponse = await app.inject({
      method: 'POST',
      url: '/api/otp/request',
      payload: { email: testEmail },
    });
    cookieJar.update(requestResponse);

    expect(requestResponse.statusCode).toBe(200);
    expect(requestResponse.json().success).toBe(true);
    expect(requestResponse.json().message).toContain('If this email is registered');
    expect(capturedOtpCode).toMatch(/^\d{6}$/); // 6-digit code

    console.log(`✓ OTP code requested and generated: ${capturedOtpCode}`);

    // Step 2: Check session is not authenticated yet
    const sessionBefore = await app.inject({
      method: 'GET',
      url: '/api/otp/session',
      headers: { cookie: cookieJar.get() },
    });

    expect(sessionBefore.statusCode).toBe(200);
    expect(sessionBefore.json().authenticated).toBe(false);
    expect(sessionBefore.json().account).toBeNull();

    console.log('✓ Session is not authenticated before verification');

    // Step 3: Verify OTP code
    const verifyResponse = await app.inject({
      method: 'POST',
      url: '/api/otp/verify',
      payload: {
        email: testEmail,
        code: capturedOtpCode,
      },
      headers: { cookie: cookieJar.get() },
    });
    cookieJar.update(verifyResponse);

    expect(verifyResponse.statusCode).toBe(200);
    expect(verifyResponse.json().success).toBe(true);

    console.log('✓ OTP code verified successfully');

    // Step 4: Check session is now authenticated
    const sessionAfter = await app.inject({
      method: 'GET',
      url: '/api/otp/session',
      headers: { cookie: cookieJar.get() },
    });

    expect(sessionAfter.statusCode).toBe(200);
    expect(sessionAfter.json().authenticated).toBe(true);
    expect(sessionAfter.json().account).toBeDefined();
    expect(sessionAfter.json().account.email).toBe(testEmail);
    expect(sessionAfter.json().authMethod).toBe('otp');

    console.log(`✓ Session authenticated for user: ${sessionAfter.json().account.email}`);

    // Step 5: Logout
    const logoutResponse = await app.inject({
      method: 'POST',
      url: '/api/otp/logout',
      headers: { cookie: cookieJar.get() },
    });
    cookieJar.update(logoutResponse);

    expect(logoutResponse.statusCode).toBe(200);

    console.log('✓ User logged out');

    // Step 6: Verify session is destroyed
    const sessionFinal = await app.inject({
      method: 'GET',
      url: '/api/otp/session',
      headers: { cookie: cookieJar.get() },
    });

    expect(sessionFinal.statusCode).toBe(200);
    expect(sessionFinal.json().authenticated).toBe(false);
    expect(sessionFinal.json().account).toBeNull();

    console.log('✓ Session destroyed after logout');

    console.log('\n✅ Complete OTP flow test passed!');
  });
});
