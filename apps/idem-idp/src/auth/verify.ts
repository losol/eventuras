import { jwtVerify, createLocalJWKSet } from 'jose';
import { getPublicJWKS } from '../crypto/jwks';
import { config } from '../config';
import { Logger } from '@eventuras/logger';

const logger = Logger.create({ namespace: 'idem:auth:verify' });

export interface VerifiedToken {
  sub: string;
  clientId: string;
  scope: string;
}

/**
 * Verify an access token JWT against the local JWKS.
 *
 * Validates signature, issuer, and expiration.
 * Returns the verified payload or null if invalid.
 */
export async function verifyAccessToken(token: string): Promise<VerifiedToken | null> {
  try {
    const jwks = await getPublicJWKS();
    const keySet = createLocalJWKSet(jwks as any);

    const { payload } = await jwtVerify(token, keySet, {
      issuer: config.issuer,
    });

    const sub = payload.sub;
    const clientId = (payload as any).client_id ?? (payload as any).azp;

    if (!sub || !clientId) {
      logger.warn({ sub, clientId }, 'Token missing required claims');
      return null;
    }

    return {
      sub,
      clientId,
      scope: typeof payload.scope === 'string' ? payload.scope : '',
    };
  } catch (error) {
    logger.warn({ error: (error as Error).message }, 'Access token verification failed');
    return null;
  }
}
