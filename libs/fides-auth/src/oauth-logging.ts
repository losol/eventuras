import type { OAuthConfig } from './oauth';

/**
 * Returns a structured, log-safe context describing an `OAuthConfig`.
 *
 * Excludes `clientSecret`. Use this to attach provider configuration to log
 * lines for debugging OAuth/OIDC flows without leaking credentials.
 */
export function getOAuthConfigLogContext(config: OAuthConfig) {
  return {
    clientId: config.clientId,
    issuer: config.issuer,
    redirectUri: config.redirect_uri,
    scope: config.scope,
    usePar: config.usePar ?? false,
  };
}

/**
 * Returns a structured log context for an unknown OAuth-related error.
 *
 * `oauth4webapi` (used via `openid-client`) wraps OAuth response errors. The
 * original OAuth response (`{error, error_description, ...}`) usually lives
 * either on the error itself or on `cause`.
 *
 * @see https://github.com/panva/oauth4webapi/blob/main/docs/classes/ResponseBodyError.md
 */
export function getOAuthErrorLogContext(error: unknown) {
  if (typeof error !== 'object' || error === null) {
    return { value: error };
  }

  const candidate = error as Record<string, unknown>;
  const cause =
    typeof candidate.cause === 'object' && candidate.cause !== null
      ? (candidate.cause as Record<string, unknown>)
      : null;

  // OAuth-specific fields (code/error/error_description) may live either on
  // the error itself or on `cause` depending on how oauth4webapi wraps the
  // response. Prefer the top-level value but fall back to `cause`.
  return {
    code: stringProp(candidate, 'code') ?? (cause ? stringProp(cause, 'code') : undefined),
    error: stringProp(candidate, 'error') ?? (cause ? stringProp(cause, 'error') : undefined),
    errorDescription:
      stringProp(candidate, 'error_description') ??
      (cause ? stringProp(cause, 'error_description') : undefined),
    message: stringProp(candidate, 'message'),
    name: stringProp(candidate, 'name'),
    status: numberProp(candidate, 'status'),
    causeMessage: cause ? stringProp(cause, 'message') : undefined,
    causeName: cause ? stringProp(cause, 'name') : undefined,
  };
}

function stringProp(value: Record<string, unknown>, key: string): string | undefined {
  return typeof value[key] === 'string' ? (value[key] as string) : undefined;
}

function numberProp(value: Record<string, unknown>, key: string): number | undefined {
  return typeof value[key] === 'number' ? (value[key] as number) : undefined;
}
