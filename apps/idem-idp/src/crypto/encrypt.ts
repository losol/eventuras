import crypto from 'crypto';
import { promisify } from 'util';
import { config } from '../config';

const scrypt = promisify(crypto.scrypt) as (
  password: string | Buffer,
  salt: Buffer,
  keylen: number
) => Promise<Buffer>;

/**
 * Encrypt a string using AES-256-GCM with the master key.
 * Returns a JSON string containing salt, iv, authTag, and encrypted data.
 */
export async function encrypt(plaintext: string): Promise<string> {
  const salt = crypto.randomBytes(32);
  const iv = crypto.randomBytes(12);
  const key = await scrypt(config.masterKey, salt, 32);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  return JSON.stringify({
    salt: salt.toString('base64'),
    iv: iv.toString('base64'),
    authTag: authTag.toString('base64'),
    encrypted: encrypted.toString('base64'),
  });
}

/**
 * Decrypt a string encrypted with encrypt().
 * Returns the original plaintext.
 */
export async function decrypt(encryptedData: string): Promise<string> {
  const { salt, iv, authTag, encrypted } = JSON.parse(encryptedData);
  const key = await scrypt(config.masterKey, Buffer.from(salt, 'base64'), 32);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(iv, 'base64'));
  decipher.setAuthTag(Buffer.from(authTag, 'base64'));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encrypted, 'base64')),
    decipher.final(),
  ]);
  return decrypted.toString('utf8');
}
