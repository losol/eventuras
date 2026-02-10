import { describe, it, expect } from 'vitest';
import { encrypt, decrypt } from './encrypt';

describe('AES-256-GCM Encryption', () => {
  describe('encrypt', () => {
    it('should return a JSON string with expected fields', async () => {
      const result = await encrypt('hello world');
      const parsed = JSON.parse(result);

      expect(parsed).toHaveProperty('salt');
      expect(parsed).toHaveProperty('iv');
      expect(parsed).toHaveProperty('authTag');
      expect(parsed).toHaveProperty('encrypted');
    });

    it('should produce different ciphertext for same plaintext (random salt/IV)', async () => {
      const plaintext = 'same input';
      const result1 = await encrypt(plaintext);
      const result2 = await encrypt(plaintext);

      expect(result1).not.toBe(result2);
    });
  });

  describe('decrypt', () => {
    it('should round-trip correctly', async () => {
      const plaintext = 'secret client data';
      const encrypted = await encrypt(plaintext);
      const decrypted = await decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it('should handle empty string', async () => {
      const encrypted = await encrypt('');
      const decrypted = await decrypt(encrypted);

      expect(decrypted).toBe('');
    });

    it('should handle unicode and special characters', async () => {
      const inputs = [
        'norsk: æøå ÆØÅ',
        'emoji: 🔐🔑',
        'json: {"key":"value"}',
        'long: ' + 'a'.repeat(10000),
      ];

      for (const input of inputs) {
        const encrypted = await encrypt(input);
        const decrypted = await decrypt(encrypted);
        expect(decrypted).toBe(input);
      }
    });
  });

  describe('tamper detection', () => {
    it('should fail on modified ciphertext', async () => {
      const encrypted = await encrypt('sensitive');
      const parsed = JSON.parse(encrypted);

      // Flip a byte in the encrypted data
      const buf = Buffer.from(parsed.encrypted, 'base64');
      buf[0] = buf[0]! ^ 0xff;
      parsed.encrypted = buf.toString('base64');

      await expect(decrypt(JSON.stringify(parsed))).rejects.toThrow();
    });

    it('should fail on modified authTag', async () => {
      const encrypted = await encrypt('sensitive');
      const parsed = JSON.parse(encrypted);

      const buf = Buffer.from(parsed.authTag, 'base64');
      buf[0] = buf[0]! ^ 0xff;
      parsed.authTag = buf.toString('base64');

      await expect(decrypt(JSON.stringify(parsed))).rejects.toThrow();
    });

    it('should fail on invalid JSON input', async () => {
      await expect(decrypt('not-json')).rejects.toThrow();
    });
  });
});
