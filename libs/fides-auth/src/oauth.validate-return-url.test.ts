import { describe, it, expect } from 'vitest';
import { validateReturnUrl } from './oauth';

const origin = 'https://example.com';

describe('validateReturnUrl', () => {
  it('returns the returnTo path as a full URL', () => {
    const url = validateReturnUrl('/dashboard', origin);
    expect(url.toString()).toBe('https://example.com/dashboard');
  });

  it('falls back to defaultPath when returnTo is null', () => {
    const url = validateReturnUrl(null, origin, '/home');
    expect(url.pathname).toBe('/home');
  });

  it('falls back to defaultPath when returnTo is undefined', () => {
    const url = validateReturnUrl(undefined, origin);
    expect(url.pathname).toBe('/');
  });

  it('rejects absolute URLs to a different origin', () => {
    const url = validateReturnUrl('https://evil.com/steal', origin);
    expect(url.origin).toBe(origin);
    expect(url.pathname).toBe('/');
  });

  it('rejects protocol-relative URLs', () => {
    const url = validateReturnUrl('//evil.com/steal', origin);
    expect(url.origin).toBe(origin);
    expect(url.pathname).toBe('/');
  });

  it('allows same-origin absolute URLs', () => {
    const url = validateReturnUrl('https://example.com/safe', origin);
    expect(url.toString()).toBe('https://example.com/safe');
  });

  it('handles unusual paths gracefully', () => {
    // new URL('://broken', origin) resolves to a relative path, which is fine
    const url = validateReturnUrl('://broken', origin, '/fallback');
    expect(url.origin).toBe(origin);
  });

  it('preserves query parameters in returnTo', () => {
    const url = validateReturnUrl('/search?q=test', origin);
    expect(url.pathname).toBe('/search');
    expect(url.searchParams.get('q')).toBe('test');
  });

  it('uses custom defaultPath', () => {
    const url = validateReturnUrl(null, origin, '/admin');
    expect(url.pathname).toBe('/admin');
  });

  it('applies custom validate function and rejects', () => {
    const url = validateReturnUrl('/public/page', origin, '/admin', (p) => p.startsWith('/admin'));
    expect(url.pathname).toBe('/admin');
  });

  it('applies custom validate function and accepts', () => {
    const url = validateReturnUrl('/admin/users', origin, '/admin', (p) => p.startsWith('/admin'));
    expect(url.pathname).toBe('/admin/users');
  });
});
