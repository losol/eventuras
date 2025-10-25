import { OAuth2Client, type Credentials, type GenerateAuthUrlOpts } from 'google-auth-library';
import type { OAuthClientConfig } from './types';

function assertValue<T>(value: T | undefined, field: string): T {
  if (value === undefined || value === null || value === '') {
    throw new Error(`Missing required Google OAuth field: ${field}`);
  }

  return value;
}

export function createOAuthClient(config: OAuthClientConfig): OAuth2Client {
  const clientId = assertValue(config.clientId, 'clientId');
  const clientSecret = assertValue(config.clientSecret, 'clientSecret');
  const redirectUri = assertValue(config.redirectUri, 'redirectUri');

  return new OAuth2Client(clientId, clientSecret, redirectUri);
}

export function generateOAuthConsentUrl(
  client: OAuth2Client,
  options: GenerateAuthUrlOpts,
): string {
  return client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    ...options,
  });
}

export async function exchangeCodeForTokens(
  client: OAuth2Client,
  code: string,
): Promise<Credentials> {
  const { tokens } = await client.getToken(code);
  client.setCredentials(tokens);
  return tokens;
}

type RefreshableOAuthClient = OAuth2Client & {
  refreshAccessToken?: () => Promise<{ credentials: Credentials; }>;
};

export async function refreshOAuthToken(client: OAuth2Client): Promise<Credentials> {
  const refreshable = client as RefreshableOAuthClient;

  if (typeof refreshable.refreshAccessToken === 'function') {
    const { credentials } = await refreshable.refreshAccessToken();
    client.setCredentials(credentials);
    return credentials;
  }

  const accessToken = await client.getAccessToken();
  const updated: Credentials = {
    ...client.credentials,
    access_token: accessToken.token ?? undefined,
  };
  client.setCredentials(updated);
  return updated;
}
