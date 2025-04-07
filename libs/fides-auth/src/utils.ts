import crypto, { createHash } from 'crypto';

const algorithm = 'aes-256-gcm';

/**
 * Encrypts the given text using AES-256-GCM.
 * Returns a string in the format: iv:authTag:ciphertext, all in hex.
 */
export function encrypt(text: string): string {
  // AES-GCM recommends a 12-byte IV for optimal performance.
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error('SESSION_SECRET is not defined');
  }
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(secret, "hex"), iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  return [iv.toString('hex'), tag.toString('hex'), encrypted.toString('hex')].join(':');
}

/**
 * Decrypts the data encrypted with the encrypt function.
 * Expects a string in the format: iv:authTag:ciphertext, all in hex.
 */
export function decrypt(data: string): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error('SESSION_SECRET is not defined');
  }
  const [ivHex, tagHex, encryptedHex] = data.split(':');
  if (!ivHex || !tagHex || !encryptedHex) {
    throw new Error('Invalid encrypted data format');
  }
  const iv = Buffer.from(ivHex, 'hex');
  const tag = Buffer.from(tagHex, 'hex');
  const encryptedText = Buffer.from(encryptedHex, 'hex');

  const decipher = crypto.createDecipheriv(algorithm, Buffer.from(secret, "hex"), iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
  return decrypted.toString('utf8');
}

export function sha256(data: string | Buffer): string {
  return createHash('sha256').update(data).digest('hex');
}

export function sha512(data: string | Buffer): string {
  return createHash('sha512').update(data).digest('hex');
}

/**
 * Converts a Uint8Array to a lowercase hexadecimal string.
 */
export function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Generates a random token of the given byte length and returns it as a hex string.
 * Default token length is 20 bytes (160 bits).
 *
 * @param tokenLength - The number of random bytes to generate (default is 20).
 * @returns A hex string representing the token.
 */
export function generateToken(tokenLength: number = 32): string {
  const bytes = new Uint8Array(tokenLength);
  crypto.getRandomValues(bytes);
  return toHex(bytes);
}
