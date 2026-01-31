import { describe, it, expect, beforeAll, afterEach, vi } from 'vitest';
import request from 'supertest';
import type { Application } from 'express';
import { createServer } from '../server';
import { Mailer } from '@eventuras/mailer';
import { db } from '../db/client';
import { otpCodes, accounts, otpRateLimits } from '../db/schema';
import { eq, or } from 'drizzle-orm';

describe.sequential('OTP API Routes', () => {
  let app: Application;
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
    app = createServer(undefined, mockMailer);
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
      const response = await request(app)
        .post('/api/otp/request')
        .send({ email: 'test@example.com' })
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'If this email is registered, you will receive a login code shortly.',
      });

      // Verify mailer was called
      expect(mockMailer.sendEmail).toHaveBeenCalledOnce();
      expect(capturedOtpCode).toMatch(/^\d{6}$/);
    });

    it('should return 400 for missing email', async () => {
      const response = await request(app)
        .post('/api/otp/request')
        .send({})
        .expect(400);

      expect(response.body).toEqual({
        error: 'Invalid request',
        message: 'Email is required',
      });
    });

    it('should return 400 for invalid email format', async () => {
      const response = await request(app)
        .post('/api/otp/request')
        .send({ email: 'not-an-email' })
        .expect(400);

      expect(response.body).toEqual({
        error: 'Invalid request',
        message: 'Invalid email format',
      });
    });

    it('should not leak whether account exists', async () => {
      // Request for non-existent account
      const response1 = await request(app)
        .post('/api/otp/request')
        .send({ email: 'nonexistent@example.com' })
        .expect(200);

      // Request for existing account
      const response2 = await request(app)
        .post('/api/otp/request')
        .send({ email: 'test@example.com' })
        .expect(200);

      // Both should return the same message
      expect(response1.body.message).toBe(response2.body.message);

      // Neither should include expiresAt (security fix)
      expect(response1.body.expiresAt).toBeUndefined();
      expect(response2.body.expiresAt).toBeUndefined();
    });

    it('should create account if it does not exist', async () => {
      const newEmail = 'newuser@example.com';

      // Verify account doesn't exist
      const accountBefore = await db.query.accounts.findFirst({
        where: eq(accounts.primaryEmail, newEmail),
      });
      expect(accountBefore).toBeUndefined();

      // Request OTP
      await request(app)
        .post('/api/otp/request')
        .send({ email: newEmail })
        .expect(200);

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
        await request(app)
          .post('/api/otp/request')
          .send({ email })
          .expect(200);
      }

      // 4th request should be rate limited
      const response = await request(app)
        .post('/api/otp/request')
        .send({ email })
        .expect(429);

      expect(response.body.error).toBe('Too many requests');
      expect(response.body.message).toContain('Too many OTP requests');

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
      // Request OTP
      await request(app)
        .post('/api/otp/request')
        .send({ email: 'test@example.com' })
        .expect(200);

      expect(capturedOtpCode).toBeTruthy();

      // Verify OTP
      const agent = request.agent(app); // Use agent to preserve session
      const response = await agent
        .post('/api/otp/verify')
        .send({
          email: 'test@example.com',
          code: capturedOtpCode,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.accountId).toBeDefined();

      // Verify session was created
      const sessionResponse = await agent.get('/api/otp/session').expect(200);

      expect(sessionResponse.body.authenticated).toBe(true);
      expect(sessionResponse.body.account).toBeDefined();
      expect(sessionResponse.body.account.email).toBe('test@example.com');
    });

    it('should return 400 for missing email', async () => {
      const response = await request(app)
        .post('/api/otp/verify')
        .send({ code: '123456' })
        .expect(400);

      expect(response.body.error).toBe('Invalid request');
      expect(response.body.message).toBe('Email is required');
    });

    it('should return 400 for missing code', async () => {
      const response = await request(app)
        .post('/api/otp/verify')
        .send({ email: 'test@example.com' })
        .expect(400);

      expect(response.body.error).toBe('Invalid request');
      expect(response.body.message).toBe('Code is required');
    });

    it('should return 401 for invalid code', async () => {
      // Request OTP
      await request(app)
        .post('/api/otp/request')
        .send({ email: 'test@example.com' })
        .expect(200);

      // Try to verify with wrong code
      const response = await request(app)
        .post('/api/otp/verify')
        .send({
          email: 'test@example.com',
          code: '000000', // Wrong code
        })
        .expect(401);

      expect(response.body.error).toBe('INVALID_CODE');
    });

    it('should return 401 for non-existent email', async () => {
      const response = await request(app)
        .post('/api/otp/verify')
        .send({
          email: 'nonexistent@example.com',
          code: '123456',
        })
        .expect(401);

      expect(response.body.error).toBe('NOT_FOUND');
    });

    it('should not allow code reuse', async () => {
      // Request OTP
      await request(app)
        .post('/api/otp/request')
        .send({ email: 'test@example.com' })
        .expect(200);

      expect(capturedOtpCode).toBeTruthy();

      // First verification should succeed
      await request(app)
        .post('/api/otp/verify')
        .send({
          email: 'test@example.com',
          code: capturedOtpCode,
        })
        .expect(200);

      // Second verification with same code should fail
      const response = await request(app)
        .post('/api/otp/verify')
        .send({
          email: 'test@example.com',
          code: capturedOtpCode,
        })
        .expect(401);

      expect(response.body.error).toBe('NOT_FOUND');
    });
  });

  describe('GET /api/otp/session', () => {
    it('should return session info for authenticated user', async () => {
      // Request and verify OTP
      await request(app)
        .post('/api/otp/request')
        .send({ email: 'test@example.com' })
        .expect(200);

      const agent = request.agent(app);
      await agent
        .post('/api/otp/verify')
        .send({
          email: 'test@example.com',
          code: capturedOtpCode,
        })
        .expect(200);

      // Check session
      const response = await agent.get('/api/otp/session').expect(200);

      expect(response.body.authenticated).toBe(true);
      expect(response.body.account).toBeDefined();
      expect(response.body.account.email).toBe('test@example.com');
    });

    it('should return unauthenticated for no session', async () => {
      const response = await request(app).get('/api/otp/session').expect(200);

      expect(response.body.authenticated).toBe(false);
      expect(response.body.account).toBeNull();
    });
  });

  describe('POST /api/otp/logout', () => {
    it('should destroy session on logout', async () => {
      // Login
      await request(app)
        .post('/api/otp/request')
        .send({ email: 'test@example.com' })
        .expect(200);

      const agent = request.agent(app);
      await agent
        .post('/api/otp/verify')
        .send({
          email: 'test@example.com',
          code: capturedOtpCode,
        })
        .expect(200);

      // Verify session exists
      const sessionBefore = await agent.get('/api/otp/session').expect(200);
      expect(sessionBefore.body.authenticated).toBe(true);

      // Logout
      await agent.post('/api/otp/logout').expect(200);

      // Verify session is destroyed
      const sessionAfter = await agent.get('/api/otp/session').expect(200);
      expect(sessionAfter.body.authenticated).toBe(false);
    });

    it('should handle logout without session', async () => {
      const response = await request(app).post('/api/otp/logout').expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'Logged out successfully',
      });
    });
  });

  describe('Full OTP Flow', () => {
    it('should complete full authentication flow', async () => {
      const email = 'fullflow@example.com';
      const agent = request.agent(app);

      // Step 1: Request OTP
      const requestResponse = await agent
        .post('/api/otp/request')
        .send({ email })
        .expect(200);

      expect(requestResponse.body.success).toBe(true);
      expect(capturedOtpCode).toMatch(/^\d{6}$/);

      // Step 2: Verify session is not authenticated yet
      const sessionBefore = await agent.get('/api/otp/session').expect(200);
      expect(sessionBefore.body.authenticated).toBe(false);

      // Step 3: Verify OTP code
      const verifyResponse = await agent
        .post('/api/otp/verify')
        .send({ email, code: capturedOtpCode })
        .expect(200);

      expect(verifyResponse.body.success).toBe(true);

      // Step 4: Verify session is now authenticated
      const sessionAfter = await agent.get('/api/otp/session').expect(200);
      expect(sessionAfter.body.authenticated).toBe(true);
      expect(sessionAfter.body.account.email).toBe(email);

      // Step 5: Logout
      await agent.post('/api/otp/logout').expect(200);

      // Step 6: Verify session is destroyed
      const sessionFinal = await agent.get('/api/otp/session').expect(200);
      expect(sessionFinal.body.authenticated).toBe(false);

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
