export interface Tokens {
  accessToken?: string;
  accessTokenExpiresAt?: Date;
  refreshToken?: string;
  refreshTokenExpiresAt?: Date;
}

export interface Session {
  expiresAt: Date | string;
  tokens?: Tokens;
  user?: {
    name: string;
    email: string;
    roles?: string[];
  };
}

export interface CreateSessionOptions {
  sessionDurationDays?: number;
}
