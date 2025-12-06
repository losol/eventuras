export interface Tokens {
  accessToken?: string;
  accessTokenExpiresAt?: Date;
  refreshToken?: string;
  refreshTokenExpiresAt?: Date;
}

export interface Session<TData = Record<string, unknown>> {
  tokens?: Tokens;
  user?: {
    name: string;
    email: string;
    roles?: string[];
  };
  data?: TData;
}

export interface CreateSessionOptions {
  sessionDurationDays?: number;
}
