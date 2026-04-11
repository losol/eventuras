/**
 * Tests for silent-login.ts — pure functions that can be tested without network.
 *
 * checkSilentLoginResult and requiresInteractiveLogin are important production utilities
 * for detecting whether a silent auth flow succeeded or the user must log in manually.
 */
import {
  checkSilentLoginResult,
  requiresInteractiveLogin,
  SilentLoginErrors,
} from './silent-login';

// ────────────────────────────────────────────
// checkSilentLoginResult
// ────────────────────────────────────────────

describe('checkSilentLoginResult', () => {
  it('returns success when callback URL contains a code parameter', () => {
    const url = new URL('https://app.example.com/callback?code=abc123&state=xyz');
    const result = checkSilentLoginResult(url);

    expect(result.success).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('returns failure with error when login_required', () => {
    const url = new URL(
      'https://app.example.com/callback?error=login_required&error_description=User+not+authenticated',
    );
    const result = checkSilentLoginResult(url);

    expect(result.success).toBe(false);
    expect(result.error).toBe('login_required');
    expect(result.errorDescription).toBe('User not authenticated');
  });

  it('returns failure with interaction_required error', () => {
    const url = new URL('https://app.example.com/callback?error=interaction_required');
    const result = checkSilentLoginResult(url);

    expect(result.success).toBe(false);
    expect(result.error).toBe('interaction_required');
  });

  it('returns failure with consent_required error', () => {
    const url = new URL('https://app.example.com/callback?error=consent_required');
    const result = checkSilentLoginResult(url);

    expect(result.success).toBe(false);
    expect(result.error).toBe('consent_required');
  });

  it('returns failure with account_selection_required error', () => {
    const url = new URL('https://app.example.com/callback?error=account_selection_required');
    const result = checkSilentLoginResult(url);

    expect(result.success).toBe(false);
    expect(result.error).toBe('account_selection_required');
  });

  it('handles error taking precedence over code', () => {
    // If both error and code are present, error wins
    const url = new URL('https://app.example.com/callback?error=server_error&code=abc');
    const result = checkSilentLoginResult(url);

    expect(result.success).toBe(false);
    expect(result.error).toBe('server_error');
  });

  it('returns invalid_callback when neither code nor error is present', () => {
    const url = new URL('https://app.example.com/callback');
    const result = checkSilentLoginResult(url);

    expect(result.success).toBe(false);
    expect(result.error).toBe('invalid_callback');
    expect(result.errorDescription).toContain('missing both code and error');
  });

  it('returns undefined errorDescription when not provided', () => {
    const url = new URL('https://app.example.com/callback?error=login_required');
    const result = checkSilentLoginResult(url);

    expect(result.errorDescription).toBeUndefined();
  });

  it('handles URL-encoded error descriptions', () => {
    const url = new URL(
      'https://app.example.com/callback?error=invalid_request&error_description=The+request+is+%22invalid%22',
    );
    const result = checkSilentLoginResult(url);

    expect(result.error).toBe('invalid_request');
    expect(result.errorDescription).toBe('The request is "invalid"');
  });
});

// ────────────────────────────────────────────
// requiresInteractiveLogin
// ────────────────────────────────────────────

describe('requiresInteractiveLogin', () => {
  it('returns true for login_required', () => {
    expect(requiresInteractiveLogin('login_required')).toBe(true);
  });

  it('returns true for interaction_required', () => {
    expect(requiresInteractiveLogin('interaction_required')).toBe(true);
  });

  it('returns true for consent_required', () => {
    expect(requiresInteractiveLogin('consent_required')).toBe(true);
  });

  it('returns true for account_selection_required', () => {
    expect(requiresInteractiveLogin('account_selection_required')).toBe(true);
  });

  it('returns false for unknown errors (e.g., server_error)', () => {
    expect(requiresInteractiveLogin('server_error')).toBe(false);
  });

  it('returns false for undefined', () => {
    expect(requiresInteractiveLogin(undefined)).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(requiresInteractiveLogin('')).toBe(false);
  });
});

// ────────────────────────────────────────────
// SilentLoginErrors constants
// ────────────────────────────────────────────

describe('SilentLoginErrors', () => {
  it('exposes the correct error constants', () => {
    expect(SilentLoginErrors.LOGIN_REQUIRED).toBe('login_required');
    expect(SilentLoginErrors.INTERACTION_REQUIRED).toBe('interaction_required');
    expect(SilentLoginErrors.CONSENT_REQUIRED).toBe('consent_required');
    expect(SilentLoginErrors.ACCOUNT_SELECTION_REQUIRED).toBe('account_selection_required');
  });
});
