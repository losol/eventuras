// session-validation.ts

import { jwtDecrypt } from 'jose';
import { getSessionSecretUint8Array } from './utils';
import { Session } from './session';

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

  let payload: unknown;
  try {
    ({ payload } = await jwtDecrypt(encryptedJwt, getSessionSecretUint8Array()));
  } catch (error) {
    return {
      status: 'INVALID',
      reason: `Decryption error: ${error instanceof Error ? error.message : 'Failed decrypting JWT'}`
    };
  }

  // Check if payload has the shape of a Session
  if (!isSession(payload)) {
    return {
      status: 'INVALID',
      reason: 'jwt does not seem to include a session'
    };
  }

  // Expired session?
  if (new Date(payload.expiresAt).getTime() < Date.now()) {
    return {
      session: payload,
      status: 'EXPIRED',
      reason: 'Session expired'
    };
  }

  // It's valid, return how many seconds remain
  return {
    session: payload,
    status: 'VALID',
  };
}


export function isSession(object: unknown): object is Session {
  if (typeof object !== 'object' || object === null) {
    return false;
  }

  if (typeof (object as any).expiresAt !== 'string') {
    return false;
  }

  if (
    'tokens' in object &&
    typeof (object as any).tokens !== 'object'
  ) {
    return false;
  }

  if (
    'userProfile' in object &&
    typeof (object as any).userProfile !== 'object'
  ) {
    return false;
  }

  // Seems to be a real session
  return true;
}
