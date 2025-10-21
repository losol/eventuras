// session-validation.ts

import { Logger } from '@eventuras/logger';
import { jwtDecrypt } from 'jose';
import { getSessionSecretUint8Array } from './utils';
import {Session} from './types';

const logger = Logger.create({ namespace: 'fides-auth:session-validation' });

export interface SessionValidationResult {
  session?: Session;
  status: 'VALID' | 'INVALID' | 'EXPIRED';
  accessTokenExpiresIn?: number;
  reason?: string;
}

/**
 * Validates an encrypted JWT and checks for expiration.
 *
 * @param encryptedJwt The encrypted JWT string to validate
 * @returns Session and SessionValidationResult indicating whether it's valid or not,
 *          plus accessTokenExpiresIn if valid
 */
export async function validateSessionJwt(
  encryptedJwt: string,
): Promise<SessionValidationResult> {
  logger.debug('Starting session JWT validation');

  let payload: unknown;
  try {
    ({ payload } = await jwtDecrypt(encryptedJwt, getSessionSecretUint8Array()));
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
