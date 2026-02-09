import { generateKeyPair, exportJWK } from 'jose';
import { db } from '../db/client';
import { jwksKeys } from '../db/schema/jwksKeys';
import crypto from 'crypto';
import { eq, and } from 'drizzle-orm';
import { Logger } from '@eventuras/logger';
import { encrypt, decrypt } from './encrypt';

const logger = Logger.create({ namespace: 'idem:jwks' });

// Bootstrap PS256 signing key
export async function bootstrapKeys(): Promise<void> {
  logger.debug('Checking signing keys');
  const existingKeys = await db.select().from(jwksKeys).where(eq(jwksKeys.active, true));
  if (existingKeys.length > 0) {
    logger.info({ count: existingKeys.length }, 'Found active signing keys');
    return;
  }

  logger.info('Generating PS256 key');
  const { publicKey, privateKey } = await generateKeyPair('PS256', {
    modulusLength: 2048,
    extractable: true,
  });
  const publicJwk = await exportJWK(publicKey);
  const privateJwk = await exportJWK(privateKey);
  const kid = crypto.randomBytes(16).toString('hex');

  publicJwk.kid = kid;
  publicJwk.use = 'sig';
  publicJwk.alg = 'PS256';
  privateJwk.kid = kid;

  await db.insert(jwksKeys).values({
    kid,
    use: 'sig',
    alg: 'PS256',
    kty: 'RSA',
    publicKey: publicJwk,
    privateKeyEncrypted: encrypt(JSON.stringify(privateJwk)),
    active: true,
    primary: true,
  });

  logger.info({ kid, alg: 'PS256' }, 'Generated signing key');
}

// Get public JWKS for /.well-known/jwks.json
export async function getPublicJWKS(): Promise<{ keys: object[] }> {
  const keys = await db.select().from(jwksKeys)
    .where(and(eq(jwksKeys.active, true), eq(jwksKeys.use, 'sig')));
  return { keys: keys.map(k => k.publicKey as object) };
}

// Get keystore for node-oidc-provider (includes private keys)
export async function getKeyStore(): Promise<object[]> {
  const keys = await db.select().from(jwksKeys)
    .where(and(eq(jwksKeys.active, true), eq(jwksKeys.use, 'sig')));
  return keys.map(k => JSON.parse(decrypt(k.privateKeyEncrypted)));
}
