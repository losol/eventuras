/** OAuth/OIDC token set stored in a session. */
export interface Tokens {
  accessToken?: string;
  accessTokenExpiresAt?: Date;
  refreshToken?: string;
  refreshTokenExpiresAt?: Date;
}

/** Authenticated user session with tokens, user info, and optional custom data. */
export interface Session<TData = Record<string, unknown>> {
  tokens?: Tokens;
  user?: {
    name: string;
    email: string;
    roles?: string[];
  };
  /** Application-specific data stored alongside the session. */
  data?: TData;
}

/** Options for creating or refreshing a session. */
export interface CreateSessionOptions {
  /** Session duration in days (default depends on implementation). */
  sessionDurationDays?: number;
}
