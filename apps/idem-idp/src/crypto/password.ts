import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import { Logger } from '@eventuras/logger';

const logger = Logger.create({ namespace: 'idem:crypto-password' });
const scryptAsync = promisify(scrypt);

/**
 * Hash a password using Node.js built-in scrypt
 * Format: {hash}.{salt}
 *
 * @param password - Plain text password
 * @returns Hashed password with salt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
  const hash = derivedKey.toString('hex');

  logger.debug('Password hashed');
  return `${hash}.${salt}`;
}

/**
 * Compare a supplied password with a stored hash
 *
 * @param supplied - Plain text password to check
 * @param stored - Stored hash (format: {hash}.{salt})
 * @returns True if password matches
 */
export async function comparePassword(
  supplied: string,
  stored: string
): Promise<boolean> {
  const [hashedPassword, salt] = stored.split('.');

  if (!hashedPassword || !salt) {
    logger.warn('Invalid password hash format');
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
    logger.warn('Invalid password hash length for comparison');
    return false;
  }

  try {
    const match = timingSafeEqual(hashedPasswordBuf, suppliedBuf);
    logger.debug({ match }, 'Password comparison');
    return match;
  } catch (err) {
    logger.warn({ err }, 'Password comparison failed');
    return false;
  }
}
