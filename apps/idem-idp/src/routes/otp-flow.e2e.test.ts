/**
 * End-to-end OTP Authentication Flow Test
 *
 * This test demonstrates the complete happy-path OTP flow from
 * email request → code verification → session → logout.
 *
 * Edge cases and error handling are tested in unit tests.
 */
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import request from 'supertest';
import type { Application } from 'express';
import { createServer } from '../server';
import { Mailer } from '@eventuras/mailer';
import { db } from '../db/client';
import { otpCodes, accounts, otpRateLimits } from '../db/schema';
import { eq } from 'drizzle-orm';

describe('OTP E2E Flow', () => {
  let app: Application;
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

    app = createServer(undefined, mockMailer);

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
  });

  it('should complete full OTP authentication flow', async () => {
    const agent = request.agent(app);

    // Step 1: Request OTP code
    const requestResponse = await agent
      .post('/api/otp/request')
      .send({ email: testEmail })
      .expect(200);

    expect(requestResponse.body.success).toBe(true);
    expect(requestResponse.body.message).toContain('If this email is registered');
    expect(capturedOtpCode).toMatch(/^\d{6}$/); // 6-digit code

    console.log(`✓ OTP code requested and generated: ${capturedOtpCode}`);

    // Step 2: Check session is not authenticated yet
    const sessionBefore = await agent
      .get('/api/otp/session')
      .expect(200);

    expect(sessionBefore.body.authenticated).toBe(false);
    expect(sessionBefore.body.account).toBeNull();

    console.log('✓ Session is not authenticated before verification');

    // Step 3: Verify OTP code
    const verifyResponse = await agent
      .post('/api/otp/verify')
      .send({
        email: testEmail,
        code: capturedOtpCode,
      })
      .expect(200);

    expect(verifyResponse.body.success).toBe(true);
    expect(verifyResponse.body.message).toBe('Login successful');

    console.log('✓ OTP code verified successfully');

    // Step 4: Check session is now authenticated
    const sessionAfter = await agent
      .get('/api/otp/session')
      .expect(200);

    expect(sessionAfter.body.authenticated).toBe(true);
    expect(sessionAfter.body.account).toBeDefined();
    expect(sessionAfter.body.account.email).toBe(testEmail);
    expect(sessionAfter.body.authMethod).toBe('otp');

    console.log(`✓ Session authenticated for user: ${sessionAfter.body.account.email}`);

    // Step 5: Logout
    await agent
      .post('/api/otp/logout')
      .expect(200);

    console.log('✓ User logged out');

    // Step 6: Verify session is destroyed
    const sessionFinal = await agent
      .get('/api/otp/session')
      .expect(200);

    expect(sessionFinal.body.authenticated).toBe(false);
    expect(sessionFinal.body.account).toBeNull();

    console.log('✓ Session destroyed after logout');

    console.log('\n✅ Complete OTP flow test passed!');
  });
});
