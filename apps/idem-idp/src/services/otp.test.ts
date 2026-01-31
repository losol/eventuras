import { describe, it, expect, afterEach } from 'vitest';
import {
  generateOtp,
  verifyOtp,
  checkRateLimit,
  cleanupExpiredOtps,
  OtpError,
  findOrCreateAccountByEmail,
} from './otp';
import { db } from '../db/client';
import { otpCodes, otpRateLimits } from '../db/schema/otp';
import { accounts } from '../db/schema/account';
import { eq } from 'drizzle-orm';

describe('OTP Service', () => {
  const testEmail = 'test@example.com';
  const testRecipientType = 'email' as const;

  // Clean up test data after each test
  afterEach(async () => {
    await db.delete(otpCodes).where(eq(otpCodes.recipient, testEmail));
    await db.delete(otpRateLimits).where(eq(otpRateLimits.recipient, testEmail));
    await db.delete(accounts).where(eq(accounts.primaryEmail, testEmail));
  });

  describe('generateOtp', () => {
    it('should generate a 6-digit OTP code', async () => {
      const result = await generateOtp({
        recipient: testEmail,
        recipientType: testRecipientType,
      });

      expect(result.code).toMatch(/^\d{6}$/);
      expect(result.otpId).toBeTruthy();
      expect(result.expiresAt).toBeInstanceOf(Date);
      expect(result.expiresAt.getTime()).toBeGreaterThan(Date.now());
    });

    it('should store the OTP in the database', async () => {
      const result = await generateOtp({
        recipient: testEmail,
        recipientType: testRecipientType,
      });

      const [storedOtp] = await db
        .select()
        .from(otpCodes)
        .where(eq(otpCodes.id, result.otpId))
        .limit(1);

      expect(storedOtp).toBeTruthy();
      expect(storedOtp.recipient).toBe(testEmail);
      expect(storedOtp.recipientType).toBe(testRecipientType);
      expect(storedOtp.consumed).toBe(false);
      expect(storedOtp.attempts).toBe(0);
    });

    it('should link OTP to account if accountId provided', async () => {
      // Create a test account first
      const [testAccount] = await db
        .insert(accounts)
        .values({
          primaryEmail: testEmail,
          displayName: 'Test User',
          active: true,
        })
        .returning();

      const result = await generateOtp({
        recipient: testEmail,
        recipientType: testRecipientType,
        accountId: testAccount.id,
      });

      const [storedOtp] = await db
        .select()
        .from(otpCodes)
        .where(eq(otpCodes.id, result.otpId))
        .limit(1);

      expect(storedOtp.accountId).toBe(testAccount.id);
    });

    it('should create rate limit record on first request', async () => {
      await generateOtp({
        recipient: testEmail,
        recipientType: testRecipientType,
      });

      const [rateLimit] = await db
        .select()
        .from(otpRateLimits)
        .where(eq(otpRateLimits.recipient, testEmail))
        .limit(1);

      expect(rateLimit).toBeTruthy();
      expect(rateLimit.requestCount).toBe(1);
      expect(rateLimit.blocked).toBe(false);
    });
  });

  describe('verifyOtp', () => {
    it('should verify a valid OTP code', async () => {
      const { code } = await generateOtp({
        recipient: testEmail,
        recipientType: testRecipientType,
      });

      const result = await verifyOtp({
        recipient: testEmail,
        recipientType: testRecipientType,
        code,
      });

      expect(result.otpId).toBeTruthy();
      expect(result.accountId).toBeNull();
    });

    it('should mark OTP as consumed after successful verification', async () => {
      const { code, otpId } = await generateOtp({
        recipient: testEmail,
        recipientType: testRecipientType,
      });

      await verifyOtp({
        recipient: testEmail,
        recipientType: testRecipientType,
        code,
      });

      const [storedOtp] = await db.select().from(otpCodes).where(eq(otpCodes.id, otpId)).limit(1);

      expect(storedOtp.consumed).toBe(true);
      expect(storedOtp.consumedAt).toBeInstanceOf(Date);
    });

    it('should throw error for invalid code', async () => {
      await generateOtp({
        recipient: testEmail,
        recipientType: testRecipientType,
      });

      await expect(
        verifyOtp({
          recipient: testEmail,
          recipientType: testRecipientType,
          code: '000000', // Wrong code
        })
      ).rejects.toThrow(OtpError);
    });

    it('should throw error for non-existent OTP', async () => {
      await expect(
        verifyOtp({
          recipient: 'nonexistent@example.com',
          recipientType: testRecipientType,
          code: '123456',
        })
      ).rejects.toThrow(OtpError);
    });

    it('should increment attempts on failed verification', async () => {
      const { otpId } = await generateOtp({
        recipient: testEmail,
        recipientType: testRecipientType,
      });

      // Try wrong code
      try {
        await verifyOtp({
          recipient: testEmail,
          recipientType: testRecipientType,
          code: '000000',
        });
      } catch {
        // Expected to fail
      }

      const [storedOtp] = await db.select().from(otpCodes).where(eq(otpCodes.id, otpId)).limit(1);

      expect(storedOtp.attempts).toBeGreaterThan(0);
    });

    it('should reject verification after max attempts exceeded', async () => {
      const { code, otpId } = await generateOtp({
        recipient: testEmail,
        recipientType: testRecipientType,
      });

      // Manually set attempts to max
      await db.update(otpCodes).set({ attempts: 5 }).where(eq(otpCodes.id, otpId));

      await expect(
        verifyOtp({
          recipient: testEmail,
          recipientType: testRecipientType,
          code,
        })
      ).rejects.toThrow(OtpError);
    });
  });

  describe('checkRateLimit', () => {
    it('should allow first request', async () => {
      await expect(checkRateLimit(testEmail, testRecipientType)).resolves.not.toThrow();
    });

    it('should block after exceeding rate limit', async () => {
      // Make 5 requests (max allowed)
      for (let i = 0; i < 5; i++) {
        await generateOtp({
          recipient: testEmail,
          recipientType: testRecipientType,
        });
      }

      // 6th request should be blocked
      await expect(
        generateOtp({
          recipient: testEmail,
          recipientType: testRecipientType,
        })
      ).rejects.toThrow(OtpError);
    });

    it('should reset window after expiration', async () => {
      // Create rate limit record with expired window
      const pastTime = new Date(Date.now() - 2 * 60 * 60 * 1000); // 2 hours ago

      await db.insert(otpRateLimits).values({
        recipient: testEmail,
        recipientType: testRecipientType,
        requestCount: 5,
        windowStart: pastTime,
        windowEnd: pastTime,
        blocked: false,
      });

      // Should reset and allow request
      await expect(checkRateLimit(testEmail, testRecipientType)).resolves.not.toThrow();

      const [rateLimit] = await db
        .select()
        .from(otpRateLimits)
        .where(eq(otpRateLimits.recipient, testEmail))
        .limit(1);

      expect(rateLimit.requestCount).toBe(1);
      expect(rateLimit.blocked).toBe(false);
    });
  });

  describe('findOrCreateAccountByEmail', () => {
    it('should find existing account', async () => {
      // Create account
      const [account] = await db
        .insert(accounts)
        .values({
          primaryEmail: testEmail,
          displayName: 'Test User',
          active: true,
        })
        .returning();

      const accountId = await findOrCreateAccountByEmail(testEmail);

      expect(accountId).toBe(account.id);
    });

    it('should create new account if not exists', async () => {
      const accountId = await findOrCreateAccountByEmail(testEmail);

      expect(accountId).toBeTruthy();

      const [account] = await db
        .select()
        .from(accounts)
        .where(eq(accounts.id, accountId))
        .limit(1);

      expect(account.primaryEmail).toBe(testEmail);
      expect(account.active).toBe(true);
    });

    it('should use email prefix as display name for new accounts', async () => {
      const accountId = await findOrCreateAccountByEmail(testEmail);

      const [account] = await db
        .select()
        .from(accounts)
        .where(eq(accounts.id, accountId))
        .limit(1);

      expect(account.displayName).toBe('test');
    });
  });

  describe('cleanupExpiredOtps', () => {
    it('should delete expired OTP codes', async () => {
      // Create expired OTP
      const pastTime = new Date(Date.now() - 2 * 60 * 60 * 1000); // 2 hours ago

      const [expiredOtp] = await db
        .insert(otpCodes)
        .values({
          recipient: testEmail,
          recipientType: testRecipientType,
          codeHash: 'dummy-hash',
          expiresAt: pastTime,
        })
        .returning();

      const deletedCount = await cleanupExpiredOtps();

      expect(deletedCount).toBeGreaterThan(0);

      const [foundOtp] = await db
        .select()
        .from(otpCodes)
        .where(eq(otpCodes.id, expiredOtp.id))
        .limit(1);

      expect(foundOtp).toBeUndefined();
    });

    it('should not delete valid OTP codes', async () => {
      const { otpId } = await generateOtp({
        recipient: testEmail,
        recipientType: testRecipientType,
      });

      await cleanupExpiredOtps();

      const [foundOtp] = await db.select().from(otpCodes).where(eq(otpCodes.id, otpId)).limit(1);

      expect(foundOtp).toBeTruthy();
    });
  });
});
