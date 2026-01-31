import { randomInt } from 'crypto';
import { db } from '../db/client';
import { otpCodes, otpRateLimits } from '../db/schema/otp';
import { accounts } from '../db/schema/account';
import { hashPassword, comparePassword } from '../crypto/hash';
import { eq, and, gt, lt } from 'drizzle-orm';
import { Logger } from '@eventuras/logger';

const logger = Logger.create({ namespace: 'idem:otp' });

/**
 * OTP Configuration
 */
const OTP_CONFIG = {
  codeLength: 6,
  expirationMinutes: 10,
  maxAttempts: 5,
  rateLimitWindow: 60, // 1 hour in minutes
  maxRequestsPerWindow: 5,
  blockDurationMinutes: 60,
} as const;

/**
 * OTP Service Errors
 */
export class OtpError extends Error {
  constructor(
    message: string,
    public code:
      | 'RATE_LIMITED'
      | 'BLOCKED'
      | 'NOT_FOUND'
      | 'EXPIRED'
      | 'MAX_ATTEMPTS'
      | 'ALREADY_CONSUMED'
      | 'INVALID_CODE'
  ) {
    super(message);
    this.name = 'OtpError';
  }
}

/**
 * Generate a random OTP code
 */
function generateOtpCode(length: number = OTP_CONFIG.codeLength): string {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return randomInt(min, max + 1).toString();
}

/**
 * Calculate expiration timestamp
 */
function getExpirationTime(minutes: number = OTP_CONFIG.expirationMinutes): Date {
  return new Date(Date.now() + minutes * 60 * 1000);
}

/**
 * Check rate limiting for OTP requests
 */
export async function checkRateLimit(
  recipient: string,
  recipientType: 'email' | 'sms'
): Promise<void> {
  const now = new Date();

  // Find existing rate limit record
  const [rateLimit] = await db
    .select()
    .from(otpRateLimits)
    .where(and(eq(otpRateLimits.recipient, recipient), eq(otpRateLimits.recipientType, recipientType)))
    .limit(1);

  if (!rateLimit) {
    // First request - create new rate limit record
    const windowEnd = getExpirationTime(OTP_CONFIG.rateLimitWindow);
    await db.insert(otpRateLimits).values({
      recipient,
      recipientType,
      requestCount: 1,
      windowStart: now,
      windowEnd,
      blocked: false,
    });
    logger.debug({ recipient, recipientType }, 'Rate limit record created');
    return;
  }

  // Check if blocked
  if (rateLimit.blocked && rateLimit.blockedUntil && rateLimit.blockedUntil > now) {
    const minutesLeft = Math.ceil((rateLimit.blockedUntil.getTime() - now.getTime()) / 60000);
    logger.warn({ recipient, recipientType, minutesLeft }, 'OTP request blocked');
    throw new OtpError(
      `Too many OTP requests. Please try again in ${minutesLeft} minutes.`,
      'BLOCKED'
    );
  }

  // Check if window has expired
  if (rateLimit.windowEnd < now) {
    // Reset window
    const windowEnd = getExpirationTime(OTP_CONFIG.rateLimitWindow);
    await db
      .update(otpRateLimits)
      .set({
        requestCount: 1,
        windowStart: now,
        windowEnd,
        blocked: false,
        blockedUntil: null,
        updatedAt: now,
      })
      .where(eq(otpRateLimits.id, rateLimit.id));
    logger.debug({ recipient, recipientType }, 'Rate limit window reset');
    return;
  }

  // Check if request limit exceeded
  if (rateLimit.requestCount >= OTP_CONFIG.maxRequestsPerWindow) {
    const blockedUntil = getExpirationTime(OTP_CONFIG.blockDurationMinutes);
    await db
      .update(otpRateLimits)
      .set({
        blocked: true,
        blockedUntil,
        updatedAt: now,
      })
      .where(eq(otpRateLimits.id, rateLimit.id));

    logger.warn({ recipient, recipientType }, 'OTP requests exceeded limit, blocking');
    throw new OtpError(
      `Too many OTP requests. Please try again in ${OTP_CONFIG.blockDurationMinutes} minutes.`,
      'RATE_LIMITED'
    );
  }

  // Increment request count
  await db
    .update(otpRateLimits)
    .set({
      requestCount: rateLimit.requestCount + 1,
      updatedAt: now,
    })
    .where(eq(otpRateLimits.id, rateLimit.id));

  logger.debug(
    { recipient, recipientType, requestCount: rateLimit.requestCount + 1 },
    'Rate limit updated'
  );
}

/**
 * Generate and store a new OTP code
 */
export async function generateOtp(params: {
  recipient: string;
  recipientType: 'email' | 'sms';
  accountId?: string;
  sessionId?: string;
}): Promise<{ otpId: string; code: string; expiresAt: Date }> {
  const { recipient, recipientType, accountId, sessionId } = params;

  // Check rate limiting
  await checkRateLimit(recipient, recipientType);

  // Generate code
  const code = generateOtpCode();
  const codeHash = await hashPassword(code);
  const expiresAt = getExpirationTime();

  // Store in database
  const [otp] = await db
    .insert(otpCodes)
    .values({
      recipient,
      recipientType,
      codeHash,
      accountId: accountId || null,
      sessionId: sessionId || null,
      expiresAt,
      maxAttempts: OTP_CONFIG.maxAttempts,
    })
    .returning();

  logger.info(
    {
      otpId: otp.id,
      recipient,
      recipientType,
      expiresAt,
    },
    'OTP code generated'
  );

  return {
    otpId: otp.id,
    code, // Return plaintext code (to be sent via email/SMS)
    expiresAt,
  };
}

/**
 * Verify an OTP code
 */
export async function verifyOtp(params: {
  recipient: string;
  recipientType: 'email' | 'sms';
  code: string;
}): Promise<{ otpId: string; accountId: string | null; sessionId: string | null }> {
  const { recipient, recipientType, code } = params;
  const now = new Date();

  // Find valid OTP codes for this recipient
  const otps = await db
    .select()
    .from(otpCodes)
    .where(
      and(
        eq(otpCodes.recipient, recipient),
        eq(otpCodes.recipientType, recipientType),
        eq(otpCodes.consumed, false),
        gt(otpCodes.expiresAt, now)
      )
    )
    .orderBy(otpCodes.createdAt);

  if (otps.length === 0) {
    logger.warn({ recipient, recipientType }, 'No valid OTP found');
    throw new OtpError('Invalid or expired code', 'NOT_FOUND');
  }

  // Try to verify against each valid OTP (newest first, in reverse)
  for (const otp of otps.reverse()) {
    // Check if max attempts exceeded
    if (otp.attempts >= otp.maxAttempts) {
      logger.warn({ otpId: otp.id, attempts: otp.attempts }, 'Max OTP attempts exceeded');
      continue;
    }

    // Increment attempts
    await db
      .update(otpCodes)
      .set({ attempts: otp.attempts + 1 })
      .where(eq(otpCodes.id, otp.id));

    // Verify code
    const isValid = await comparePassword(code, otp.codeHash);

    if (isValid) {
      // Mark as consumed
      await db
        .update(otpCodes)
        .set({
          consumed: true,
          consumedAt: now,
        })
        .where(eq(otpCodes.id, otp.id));

      logger.info(
        {
          otpId: otp.id,
          recipient,
          recipientType,
          attempts: otp.attempts + 1,
        },
        'OTP verified successfully'
      );

      return {
        otpId: otp.id,
        accountId: otp.accountId,
        sessionId: otp.sessionId,
      };
    }
  }

  // All attempts failed
  logger.warn({ recipient, recipientType }, 'OTP verification failed');
  throw new OtpError('Invalid code', 'INVALID_CODE');
}

/**
 * Find or create account by email
 */
export async function findOrCreateAccountByEmail(email: string): Promise<string> {
  // Try to find existing account
  const [existingAccount] = await db
    .select()
    .from(accounts)
    .where(eq(accounts.primaryEmail, email))
    .limit(1);

  if (existingAccount) {
    logger.debug({ accountId: existingAccount.id, email }, 'Account found');
    return existingAccount.id;
  }

  // Create new account
  const [newAccount] = await db
    .insert(accounts)
    .values({
      primaryEmail: email,
      displayName: email.split('@')[0], // Use email prefix as display name
      active: true,
    })
    .returning();

  logger.info({ accountId: newAccount.id, email }, 'New account created');
  return newAccount.id;
}

/**
 * Clean up expired OTP codes (should be run periodically)
 */
export async function cleanupExpiredOtps(): Promise<number> {
  const now = new Date();

  const deleted = await db
    .delete(otpCodes)
    .where(lt(otpCodes.expiresAt, now))
    .returning({ id: otpCodes.id });

  const deletedCount = deleted.length;
  logger.info({ deletedCount }, 'Expired OTP codes cleaned up');
  return deletedCount;
}
