// session-validation.ts

import { jwtDecrypt } from 'jose';

import { createLogger } from './logger';
import { hexToUint8Array } from './utils';
import { Session } from './types';

const logger = createLogger({ namespace: 'fides-auth:session-validation' });

/** Result of validating an encrypted session JWT. */
export interface SessionValidationResult {
  /** The decoded session, if valid. */
  session?: Session;
  /** Validation status: VALID, INVALID (decryption/format error), or EXPIRED. */
  status: 'VALID' | 'INVALID' | 'EXPIRED';
  /** Seconds until the access token expires (negative means already expired). */
  accessTokenExpiresIn?: number;
  /** Human-readable reason when status is not VALID. */
  reason?: string;
}

/**
 * Validates an encrypted JWT and checks for expiration.
 *
 * @param encryptedJwt The encrypted JWT string to validate
 * @param secret The decryption key as a hex string or Uint8Array (32 bytes for A256GCM)
 * @returns Session and SessionValidationResult indicating whether it's valid or not,
 *          plus accessTokenExpiresIn if valid
 */
export async function validateSessionJwt(
  encryptedJwt: string,
  secret: string | Uint8Array,
): Promise<SessionValidationResult> {
  logger.debug('Starting session JWT validation');

  const secretBytes = typeof secret === 'string'
    ? hexToUint8Array(secret)
    : secret;

  let payload: unknown;
  try {
    ({ payload } = await jwtDecrypt(encryptedJwt, secretBytes));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed decrypting JWT';
    logger.warn({ reason: errorMessage }, 'Session JWT decryption failed');
    return {
      status: 'INVALID',
      reason: `Decryption error: ${errorMessage}`
    };
  }

  // Check if payload has the shape of a Session
  if (!isSession(payload)) {
    logger.warn('JWT payload does not match Session structure');
    return {
      status: 'INVALID',
      reason: 'jwt does not seem to include a session'
    };
  }

  logger.debug('Session validated successfully');

  // It's valid
  return {
    session: payload,
    status: 'VALID',
  };
}


/** Type guard that checks whether an unknown value conforms to the {@link Session} shape. */
export function isSession(object: unknown): object is Session {
  if (typeof object !== 'object' || object === null) {
    return false;
  }

  if (
    'tokens' in object &&
    typeof (object as any).tokens !== 'object'
  ) {
    return false;
  }

  if (
    'user' in object &&
    typeof (object as any).user !== 'object'
  ) {
    return false;
  }

  // Seems to be a real session
  return true;
}
