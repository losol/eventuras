import { describe, it, expect } from 'vitest';
import { hashPassword, comparePassword } from './password';

describe('Password Hashing (scrypt)', () => {
  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const password = 'testPassword123';
      const hash = await hashPassword(password);

      expect(hash).toBeTruthy();
      expect(typeof hash).toBe('string');
      expect(hash).toContain('.'); // Format: {hash}.{salt}
    });

    it('should generate different hashes for same password', async () => {
      const password = 'samePassword';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2); // Different salts
    });

    it('should include salt in hash', async () => {
      const hash = await hashPassword('password');
      const [hashPart, saltPart] = hash.split('.');

      expect(hashPart).toBeTruthy();
      expect(saltPart).toBeTruthy();
      expect(hashPart.length).toBeGreaterThan(0);
      expect(saltPart.length).toBeGreaterThan(0);
    });
  });

  describe('comparePassword', () => {
    it('should return true for correct password', async () => {
      const password = 'correctPassword';
      const hash = await hashPassword(password);

      const match = await comparePassword(password, hash);
      expect(match).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      const password = 'correctPassword';
      const hash = await hashPassword(password);

      const match = await comparePassword('wrongPassword', hash);
      expect(match).toBe(false);
    });

    it('should handle invalid hash format', async () => {
      const match = await comparePassword('password', 'invalid-hash');
      expect(match).toBe(false);
    });

    it('should handle empty hash parts', async () => {
      const match = await comparePassword('password', '.');
      expect(match).toBe(false);
    });
  });

  describe('Integration', () => {
    it('should work with typical passwords', async () => {
      const passwords = [
        'short',
        'a very long password with spaces and numbers 12345',
        'P@ssw0rd!',
        'unicode-密码-🔐',
      ];

      for (const password of passwords) {
        const hash = await hashPassword(password);
        const match = await comparePassword(password, hash);
        expect(match).toBe(true);
      }
    });
  });
});
