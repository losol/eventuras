import crypto from 'crypto';

import Environment, { EnvironmentVariables } from '@/utils/Environment';

const algorithm = 'aes-256-gcm';
// The encryption key should be 32 bytes (256 bits) in hexadecimal format.
// Could be generated using: `openssl rand -hex 32`.
const sessionSecret = Environment.get(EnvironmentVariables.SESSION_SECRET) as string;
if (!sessionSecret) {
  throw new Error('SESSION_SECRET is not defined in the environment variables.');
}
const secret = Buffer.from(sessionSecret, 'hex');

/**
 * Encrypts the given text using AES-256-GCM.
 * Returns a string in the format: iv:authTag:ciphertext, all in hex.
 */
export function encrypt(text: string): string {
  // AES-GCM recommends a 12-byte IV for optimal performance.
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(algorithm, secret, iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  return [iv.toString('hex'), tag.toString('hex'), encrypted.toString('hex')].join(':');
}

/**
 * Decrypts the data encrypted with the encrypt function.
 * Expects a string in the format: iv:authTag:ciphertext, all in hex.
 */
export function decrypt(data: string): string {
  const [ivHex, tagHex, encryptedHex] = data.split(':');
  if (!ivHex || !tagHex || !encryptedHex) {
    throw new Error('Invalid encrypted data format');
  }
  const iv = Buffer.from(ivHex, 'hex');
  const tag = Buffer.from(tagHex, 'hex');
  const encryptedText = Buffer.from(encryptedHex, 'hex');

  const decipher = crypto.createDecipheriv(algorithm, secret, iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
  return decrypted.toString('utf8');
}
