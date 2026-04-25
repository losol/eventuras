import * as jose from 'jose';

import { createLogger } from './logger';
import type { Session } from './types';

const logger = createLogger({ namespace: 'fides-auth:utils' });


/**
 * Converts a hex string to a Uint8Array.
 *
 * @param hex - A hexadecimal string.
 * @returns A Uint8Array representing the bytes of the hex string.
 */
export function hexToUint8Array(hex: string): Uint8Array {
  if (hex.length % 2 !== 0) {
    throw new Error('Invalid hex string: odd length');
  }
  if (hex.length > 0 && !/^[0-9a-fA-F]+$/.test(hex)) {
    throw new Error('Invalid hex string: contains non-hex characters');
  }
  const arr = new Uint8Array(hex.length / 2);
  for (let i = 0; i < arr.length; i++) {
    arr[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return arr;
}

/**
 * Normalizes a secret to a Uint8Array.
 * Accepts either a hex-encoded string or an existing Uint8Array.
 */
function normalizeSecret(secret: string | Uint8Array): Uint8Array {
  if (typeof secret === 'string') {
    return hexToUint8Array(secret);
  }
  return secret;
}

/**
 * Encrypts a payload into a JWT using the specified secret.
 *
 * @param payload - The payload to encrypt (can be any JSON-serializable value)
 * @param secret - The encryption key as a hex string or Uint8Array (32 bytes for A256GCM)
 * @returns A promise that resolves to the encrypted JWT as a string.
 */
export async function createEncryptedJWT(
  payload: unknown,
  secret: string | Uint8Array,
): Promise<string> {
  return new jose.EncryptJWT(payload as jose.JWTPayload)
    .setProtectedHeader({ alg: 'dir', enc: 'A256GCM' })
    .setIssuedAt()
    .encrypt(normalizeSecret(secret));
}


/**
 * Encrypts the given text using AES-GCM via the Web Crypto API.
 * Returns a string in the format: iv:authTag:ciphertext, all in hex.
 *
 * @param text - The plaintext to encrypt.
 * @param secret - The encryption key as a hex string or Uint8Array (32 bytes for AES-256).
 * @returns A promise that resolves to the encrypted string.
 */
export async function encrypt(text: string, secret: string | Uint8Array): Promise<string> {
  const keyData = normalizeSecret(secret);

  // Import the key for AES-GCM encryption.
  const key = await crypto.subtle.importKey(
    'raw',
    keyData as BufferSource,
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  );

  // Generate a 12-byte IV using the Web Crypto API.
  const iv = crypto.getRandomValues(new Uint8Array(12));

  // Encode the plaintext into a Uint8Array.
  const encoder = new TextEncoder();
  const data = encoder.encode(text);

  // Encrypt the data using AES-GCM.
  // Note: The Web Crypto API combines the ciphertext and authentication tag in the output.
  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv, tagLength: 128 },
    key,
    data
  );

  // Convert the encrypted data to a Uint8Array for separation.
  const encryptedArray = new Uint8Array(encryptedBuffer);
  const tagLength = 16; // AES-GCM uses a 128-bit (16-byte) tag.
  const ciphertext = encryptedArray.slice(0, encryptedArray.length - tagLength);
  const authTag = encryptedArray.slice(encryptedArray.length - tagLength);

  return [toHex(iv), toHex(authTag), toHex(ciphertext)].join(':');
}

/**
 * Decrypts data encrypted with AES-256-GCM (using the Web Crypto API).
 * The input is expected to be in the format: iv:authTag:ciphertext (all hex-encoded).
 *
 * @param data - The encrypted data string.
 * @param secret - The decryption key as a hex string or Uint8Array (32 bytes for AES-256).
 * @returns A promise that resolves to the decrypted plaintext.
 */
export async function decrypt(data: string, secret: string | Uint8Array): Promise<string> {

  // Split the incoming data. We expect exactly three parts.
  const [ivHex, tagHex, ciphertextHex] = data.split(':');
  if (!ivHex || !tagHex || !ciphertextHex) {
    throw new Error('Invalid encrypted data format');
  }

  // Convert each hex-encoded part to a Uint8Array
  const iv = hexToUint8Array(ivHex);
  const tag = hexToUint8Array(tagHex);
  const ciphertext = hexToUint8Array(ciphertextHex);

  // Concatenate ciphertext and auth tag (Web Crypto expects them combined)
  const combined = new Uint8Array(ciphertext.length + tag.length);
  combined.set(ciphertext);
  combined.set(tag, ciphertext.length);

  // Convert the secret and import it as a CryptoKey for AES-GCM decryption.
  const keyData = normalizeSecret(secret);
  // Ensure keyData is backed by a real ArrayBuffer (not SharedArrayBuffer)
  const keyDataArrayBuffer = new Uint8Array([...keyData]);

  // Ensure iv is backed by a real ArrayBuffer (not SharedArrayBuffer)
  const ivArrayBuffer = new Uint8Array([...iv]);

  const key = await crypto.subtle.importKey(
    'raw',
    keyDataArrayBuffer as BufferSource,
    { name: 'AES-GCM' },
    false,
    ['decrypt']
  );

  // Decrypt the combined ciphertext+tag using the IV.
  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: ivArrayBuffer, tagLength: 128 },
    key,
    combined.buffer
  );

  // Decode the decrypted ArrayBuffer back to a string.
  const decoder = new TextDecoder();
  return decoder.decode(decryptedBuffer);
}

/**
 * Converts input data (string or Uint8Array) to a Uint8Array backed by a plain ArrayBuffer.
 * @param data - The input data.
 * @returns A Uint8Array representing the input data.
 */
function toUint8Array(data: string | Uint8Array): Uint8Array {
  if (typeof data === 'string') {
    return new TextEncoder().encode(data);
  }
  return data;
}

/**
 * Hashes the input using SHA-256 with the Web Crypto API.
 * @param data - The input data (string or Uint8Array).
 * @returns A Promise that resolves to the SHA-256 hash as a hex string.
 */
export async function sha256(data: string | Uint8Array): Promise<string> {
  const buffer = toUint8Array(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer as BufferSource);
  return toHex(new Uint8Array(hashBuffer));
}

/**
 * Hashes the input using SHA-512 with the Web Crypto API.
 * @param data - The input data (string or Uint8Array).
 * @returns A Promise that resolves to the SHA-512 hash as a hex string.
 */
export async function sha512(data: string | Uint8Array): Promise<string> {
  const buffer = toUint8Array(data);
  const hashBuffer = await crypto.subtle.digest('SHA-512', buffer as BufferSource);
  return toHex(new Uint8Array(hashBuffer));
}

/**
 * Retrieves the session secret from environment variables.
 * Throws an error if the SESSION_SECRET is not defined.
 *
 * @returns {string} The session secret.
 */
export function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error('SESSION_SECRET is not defined');
  }
  return secret;
}

/**
 * Retrieves the session secret from environment variables as Uint8Array .
 * Throws an error if the SESSION_SECRET is not defined.
 *
 * @returns {Uint8Array} The session secret as Uint8Array.
 */
export function getSessionSecretUint8Array(): Uint8Array {
  const secret = getSessionSecret();
  const keyData = hexToUint8Array(secret);
  // Ensure it's backed by a regular ArrayBuffer (not SharedArrayBuffer)
  return new Uint8Array([...keyData]);
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


/**
 * Determines if the access token of a session will expire in less than the given threshold.
 *
 * It decodes the access token (assumed to be a JWT) and reads the `exp` claim.
 * The expiration (`exp`) claim is the UNIX timestamp (in seconds) when the token expires.
 *
 * @param accessToken - The access token string.
 * @param seconds - The threshold (in seconds) for checking expiration (default is 10 seconds).
 * @returns True if the access token expires within the threshold; otherwise, false.
 */
export const accessTokenExpires = (
  accessToken: string,
  seconds: number = 10
): boolean => {
  try {
    // Decode the JWT without verifying the signature.
    const payload = jose.decodeJwt(accessToken) as { exp?: number; };

    // If there is no exp claim, assume the token does not expire
    if (!payload.exp) {
      return false;
    }

    const nowInSeconds = Date.now() / 1000;
    const remainingSeconds = payload.exp - nowInSeconds;

    return remainingSeconds < seconds;
  } catch (error) {
    // If decoding fails, treat the token as invalid so no refresh is triggered.
    logger.error(
      { error },
      'Error decoding access token'
    );
    return true;
  }
};

/**
 * Returns true if the session was granted the given scope.
 *
 * @param session - The session to check
 * @param scope - The scope string to look for (e.g. "operations.read")
 */
export function hasScope(session: Session, scope: string): boolean {
  return session.scopes?.includes(scope) ?? false;
}
