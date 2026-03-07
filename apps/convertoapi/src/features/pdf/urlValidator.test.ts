import { describe, it, expect, vi } from 'vitest';
import { validateUrl } from './urlValidator.js';

// Mock DNS lookup (returns both A and AAAA records)
vi.mock('dns/promises', () => ({
  lookup: vi.fn(async (hostname: string) => {
    const mockDns: Record<string, Array<{ address: string; family: number }>> = {
      'example.com': [{ address: '93.184.216.34', family: 4 }],
      'internal.evil.com': [{ address: '10.0.0.1', family: 4 }],
      'sneaky.com': [{ address: '192.168.1.1', family: 4 }],
    };
    const result = mockDns[hostname];
    if (!result) throw new Error(`ENOTFOUND ${hostname}`);
    return result;
  }),
}));

describe('validateUrl', () => {
  it('allows valid public https URL', async () => {
    expect(await validateUrl('https://example.com/page')).toBeNull();
  });

  it('allows valid public http URL', async () => {
    expect(await validateUrl('http://example.com/page')).toBeNull();
  });

  it('rejects invalid URL format', async () => {
    expect(await validateUrl('not-a-url')).toBe('Invalid URL format');
  });

  it('rejects file:// protocol', async () => {
    expect(await validateUrl('file:///etc/passwd')).toBe(
      'Only http and https protocols are allowed'
    );
  });

  it('rejects ftp:// protocol', async () => {
    expect(await validateUrl('ftp://example.com')).toBe(
      'Only http and https protocols are allowed'
    );
  });

  it('rejects javascript: protocol', async () => {
    expect(await validateUrl('javascript:alert(1)')).toBe(
      'Only http and https protocols are allowed'
    );
  });

  it('rejects loopback IP', async () => {
    expect(await validateUrl('http://127.0.0.1')).toBe(
      'URLs pointing to private/internal networks are not allowed'
    );
  });

  it('rejects 10.x.x.x range', async () => {
    expect(await validateUrl('http://10.0.0.1')).toBe(
      'URLs pointing to private/internal networks are not allowed'
    );
  });

  it('rejects 172.16.x.x range', async () => {
    expect(await validateUrl('http://172.16.0.1')).toBe(
      'URLs pointing to private/internal networks are not allowed'
    );
  });

  it('rejects 192.168.x.x range', async () => {
    expect(await validateUrl('http://192.168.1.1')).toBe(
      'URLs pointing to private/internal networks are not allowed'
    );
  });

  it('rejects link-local 169.254.x.x (cloud metadata)', async () => {
    expect(await validateUrl('http://169.254.169.254/latest/meta-data')).toBe(
      'URLs pointing to private/internal networks are not allowed'
    );
  });

  it('rejects IPv6 loopback', async () => {
    expect(await validateUrl('http://[::1]')).toBe(
      'URLs pointing to private/internal networks are not allowed'
    );
  });

  it('rejects hostname that resolves to private IP', async () => {
    expect(await validateUrl('http://internal.evil.com')).toBe(
      'URL resolves to a private/internal IP address'
    );
  });

  it('rejects hostname resolving to 192.168.x.x', async () => {
    expect(await validateUrl('http://sneaky.com')).toBe(
      'URL resolves to a private/internal IP address'
    );
  });

  it('rejects unresolvable hostname', async () => {
    expect(await validateUrl('http://does-not-exist.invalid')).toBe(
      'Could not resolve hostname'
    );
  });
});
