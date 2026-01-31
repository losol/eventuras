import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import { Logger } from '@eventuras/logger';

const logger = Logger.create({ namespace: 'idem:crypto-hash' });
const scryptAsync = promisify(scrypt);

/**
 * Hash a secret value (password, OTP code, etc.) using Node.js built-in scrypt
 * Format: {hash}.{salt}
 *
 * @param password - Plain text secret value to hash
 * @returns Hashed value with salt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
  const hash = derivedKey.toString('hex');

  logger.debug('Value hashed');
  return `${hash}.${salt}`;
}

/**
 * Compare a supplied secret value with a stored hash
 * Uses timing-safe comparison to prevent timing attacks
 *
 * @param supplied - Plain text value to check
 * @param stored - Stored hash (format: {hash}.{salt})
 * @returns True if value matches hash
 */
export async function comparePassword(
  supplied: string,
  stored: string
): Promise<boolean> {
  const [hashedPassword, salt] = stored.split('.');

  if (!hashedPassword || !salt) {
    logger.warn('Invalid hash format');
    return false;
  }

  const hashedPasswordBuf = Buffer.from(hashedPassword, 'hex');
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;

  // Ensure buffers are valid and of equal length before timing-safe compare
  // timingSafeEqual throws if buffers have different lengths
  if (
    hashedPasswordBuf.length === 0 ||
    suppliedBuf.length === 0 ||
    hashedPasswordBuf.length !== suppliedBuf.length
  ) {
    logger.warn('Invalid hash length for comparison');
    return false;
  }

  try {
    const match = timingSafeEqual(hashedPasswordBuf, suppliedBuf);
    logger.debug({ match }, 'Hash comparison');
    return match;
  } catch (err) {
    logger.warn({ err }, 'Hash comparison failed');
    return false;
  }
}
