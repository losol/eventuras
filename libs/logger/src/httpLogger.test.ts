import { describe, it, expect } from 'vitest';
import { redactHeaders } from './httpLogger.js';

describe('redactHeaders', () => {
  const SENSITIVE = ['authorization', 'cookie', 'set-cookie', 'x-api-key', 'x-auth-token', 'proxy-authorization'];

  describe('with Record<string, unknown> input', () => {
    it('redacts sensitive headers', () => {
      const result = redactHeaders({
        Authorization: 'Bearer secret-token',
        'Content-Type': 'application/json',
        Cookie: 'session=abc',
      });

      expect(result['Authorization']).toBe('[REDACTED]');
      expect(result['Content-Type']).toBe('application/json');
      expect(result['Cookie']).toBe('[REDACTED]');
    });

    it('is case-insensitive', () => {
      const result = redactHeaders({
        AUTHORIZATION: 'Bearer token',
        'x-api-key': 'key123',
        'X-AUTH-TOKEN': 'token456',
      });

      expect(result['AUTHORIZATION']).toBe('[REDACTED]');
      expect(result['x-api-key']).toBe('[REDACTED]');
      expect(result['X-AUTH-TOKEN']).toBe('[REDACTED]');
    });

    it('passes through non-sensitive headers', () => {
      const result = redactHeaders({
        'Content-Type': 'text/html',
        'Accept': 'application/json',
        'X-Request-Id': 'abc-123',
      });

      expect(result['Content-Type']).toBe('text/html');
      expect(result['Accept']).toBe('application/json');
      expect(result['X-Request-Id']).toBe('abc-123');
    });

    it('converts non-string values to strings', () => {
      const result = redactHeaders({
        'X-Count': 42,
        'X-Flag': true,
      });

      expect(result['X-Count']).toBe('42');
      expect(result['X-Flag']).toBe('true');
    });

    it('handles empty input', () => {
      const result = redactHeaders({});
      expect(result).toEqual({});
    });
  });

  describe('with Headers input', () => {
    it('redacts sensitive headers', () => {
      const headers = new Headers();
      headers.set('authorization', 'Bearer token');
      headers.set('content-type', 'application/json');

      const result = redactHeaders(headers);

      expect(result['authorization']).toBe('[REDACTED]');
      expect(result['content-type']).toBe('application/json');
    });

    it('handles all sensitive headers', () => {
      const headers = new Headers();
      for (const name of SENSITIVE) {
        headers.set(name, 'secret-value');
      }
      headers.set('accept', 'text/plain');

      const result = redactHeaders(headers);

      for (const name of SENSITIVE) {
        expect(result[name]).toBe('[REDACTED]');
      }
      expect(result['accept']).toBe('text/plain');
    });
  });

  describe('with array input', () => {
    it('redacts sensitive headers', () => {
      const headers: [string, string][] = [
        ['Authorization', 'Bearer token'],
        ['Content-Type', 'application/json'],
        ['X-Api-Key', 'secret'],
      ];

      const result = redactHeaders(headers);

      expect(result['Authorization']).toBe('[REDACTED]');
      expect(result['Content-Type']).toBe('application/json');
      expect(result['X-Api-Key']).toBe('[REDACTED]');
    });

    it('handles empty array', () => {
      const result = redactHeaders([]);
      expect(result).toEqual({});
    });
  });

  it('redacts all known sensitive headers', () => {
    const input: Record<string, string> = {};
    for (const name of SENSITIVE) {
      input[name] = 'secret';
    }
    input['safe-header'] = 'visible';

    const result = redactHeaders(input);

    for (const name of SENSITIVE) {
      expect(result[name]).toBe('[REDACTED]');
    }
    expect(result['safe-header']).toBe('visible');
  });
});
