import { generateKeyPair, exportJWK } from 'jose';
import { db } from '../db/client';
import { jwksKeys } from '../db/schema/oauth';
import crypto from 'crypto';
import { config } from '../config';
import { eq, and } from 'drizzle-orm';
import { Logger } from '@eventuras/logger';

const logger = Logger.create({ namespace: 'idem:jwks' });

// Encrypt private key using AES-256-GCM
function encryptPrivateKey(privateKeyJwk: object): string {
  const algorithm = 'aes-256-gcm';
  const salt = crypto.randomBytes(32); // Generate unique salt per key
  const iv = crypto.randomBytes(12); // 12 bytes (96 bits) is standard for GCM
  const key = crypto.scryptSync(config.masterKey, salt, 32);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(privateKeyJwk), 'utf8'),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  return JSON.stringify({
    salt: salt.toString('base64'), // Store salt with ciphertext
    iv: iv.toString('base64'),
    authTag: authTag.toString('base64'),
    encrypted: encrypted.toString('base64'),
  });
}

function decryptPrivateKey(encryptedData: string): object {
  const { salt, iv, authTag, encrypted } = JSON.parse(encryptedData);
  const key = crypto.scryptSync(config.masterKey, Buffer.from(salt, 'base64'), 32);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(iv, 'base64'));
  decipher.setAuthTag(Buffer.from(authTag, 'base64'));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encrypted, 'base64')),
    decipher.final(),
  ]);
  return JSON.parse(decrypted.toString('utf8'));
}

// Bootstrap RS256 signing key
export async function bootstrapKeys(): Promise<void> {
  logger.debug('Checking signing keys');
  const existingKeys = await db.select().from(jwksKeys).where(eq(jwksKeys.active, true));
  if (existingKeys.length > 0) {
    logger.info({ count: existingKeys.length }, 'Found active signing keys');
    return;
  }

  logger.info('Generating RS256 key');
  const { publicKey, privateKey } = await generateKeyPair('RS256', { modulusLength: 2048 });
  const publicJwk = await exportJWK(publicKey);
  const privateJwk = await exportJWK(privateKey);
  const kid = crypto.randomBytes(16).toString('hex');

  publicJwk.kid = kid;
  publicJwk.use = 'sig';
  publicJwk.alg = 'RS256';
  privateJwk.kid = kid;

  await db.insert(jwksKeys).values({
    kid,
    use: 'sig',
    alg: 'RS256',
    kty: 'RSA',
    publicKey: publicJwk,
    privateKeyEncrypted: encryptPrivateKey(privateJwk),
    active: true,
    primary: true,
  });

  logger.info({ kid, alg: 'RS256' }, 'Generated signing key');
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
  return keys.map(k => decryptPrivateKey(k.privateKeyEncrypted));
}
