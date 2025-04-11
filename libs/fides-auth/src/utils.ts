import * as jose from 'jose';

const algorithm = 'aes-256-gcm';


/**
 * Converts a hex string to a Uint8Array.
 *
 * @param hex - A hexadecimal string.
 * @returns A Uint8Array representing the bytes of the hex string.
 */
export function hexToUint8Array(hex: string): Uint8Array {
  if (hex.length % 2 !== 0) {
    throw new Error('Invalid hex string');
  }
  const arr = new Uint8Array(hex.length / 2);
  for (let i = 0; i < arr.length; i++) {
    arr[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return arr;
}

/**
 * Encrypts a payload into a JWT using the specified secret.
 *
 * @param payload - The payload to encrypt (can be any JSON-serializable value)
 * @returns A promise that resolves to the encrypted JWT as a string.
 */
export async function createEncryptedJWT(
  payload: unknown,
): Promise<string> {
  return new jose.EncryptJWT(payload as jose.JWTPayload)
    .setProtectedHeader({ alg: 'dir', enc: 'A256GCM' })
    .setIssuedAt()
    .encrypt(getSessionSecretUint8Array());
}


/**
 * Encrypts the given text using AES-GCM via the Web Crypto API.
 * Returns a string in the format: iv:authTag:ciphertext, all in hex.
 *
 * @param text - The plaintext to encrypt.
 * @returns A promise that resolves to the encrypted string.
 */
export async function encrypt(text: string): Promise<string> {
  // Get the secret as a hex string.
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error('SESSION_SECRET is not defined');
  }

  // Convert the secret hex string to a Uint8Array.
  const keyData = Uint8Array.from(secret.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));

  // Import the key for AES-GCM encryption.
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
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

  // Helper function to convert a Uint8Array to a hex string.
  const toHex = (buffer: Uint8Array): string =>
    Array.from(buffer)
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('');

  // Format the output as "iv:authTag:ciphertext"
  return [toHex(iv), toHex(authTag), toHex(ciphertext)].join(':');
}

/**
 * Decrypts data encrypted with AES-256-GCM (using the Web Crypto API).
 * The input is expected to be in the format: iv:authTag:ciphertext (all hex-encoded).
 *
 * @param data - The encrypted data string.
 * @returns A promise that resolves to the decrypted plaintext.
 */
export async function decrypt(data: string): Promise<string> {
  // Get the session secret (hex string)
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error('SESSION_SECRET is not defined');
  }

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

  // Convert the secret into a Uint8Array and import it as a CryptoKey for AES-GCM decryption.
  const keyData = hexToUint8Array(secret);
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'AES-GCM' },
    false,
    ['decrypt']
  );

  // Decrypt the combined ciphertext+tag using the IV.
  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv, tagLength: 128 },
    key,
    combined.buffer
  );

  // Decode the decrypted ArrayBuffer back to a string.
  const decoder = new TextDecoder();
  return decoder.decode(decryptedBuffer);
}

/**
 * Helper function to convert an ArrayBuffer to a hexadecimal string.
 * @param buffer - The ArrayBuffer to convert.
 * @returns A hex string.
 */
function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Converts input data (string or Buffer) to a Uint8Array.
 * @param data - The input data.
 * @returns A Uint8Array representing the input data.
 */
function toUint8Array(data: string | Buffer): Uint8Array {
  if (typeof data === 'string') {
    return new TextEncoder().encode(data);
  }
  // Assuming Node.js Buffer; in Edge or browser environments, use appropriate conversion.
  return new Uint8Array(data);
}

/**
 * Hashes the input using SHA-256 with the Web Crypto API.
 * @param data - The input data (string or Buffer).
 * @returns A Promise that resolves to the SHA-256 hash as a hex string.
 */
export async function sha256(data: string | Buffer): Promise<string> {
  const buffer = toUint8Array(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  return bufferToHex(hashBuffer);
}

/**
 * Hashes the input using SHA-512 with the Web Crypto API.
 * @param data - The input data (string or Buffer).
 * @returns A Promise that resolves to the SHA-512 hash as a hex string.
 */
export async function sha512(data: string | Buffer): Promise<string> {
  const buffer = toUint8Array(data);
  const hashBuffer = await crypto.subtle.digest('SHA-512', buffer);
  return bufferToHex(hashBuffer);
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
 * @returns {string} The session secret.
 */
export function getSessionSecretUint8Array(): Uint8Array {
  return hexToUint8Array(getSessionSecret());
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
