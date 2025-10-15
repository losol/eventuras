export type OAuthConfig = {
  issuer: string;
  clientId: string;
  clientSecret: string;
  redirect_uri: string;
  scope: string;
};

export type SessionUser = {
  name?: string;
  email?: string;
  roles?: string[];
  [key: string]: unknown;
};

export type SessionTokens = {
  accessToken: string;
  refreshToken?: string;
  accessTokenExpiresAt?: Date;
};

export type SessionData = {
  expiresAt?: string; // ISO string
  tokens: SessionTokens;
  user?: SessionUser;
};
