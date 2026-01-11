import { Logger } from '@eventuras/logger';
import { OAuthConfig, refreshAccessToken } from "./oauth";
import { CreateSessionOptions, Session } from "./types";

const logger = Logger.create({ namespace: 'fides-auth:session-refresh' });

export const refreshSession = async (
  current_session: Session,
  config: OAuthConfig,
  options: CreateSessionOptions = {}
): Promise<Session | null> => {
  logger.debug('Starting session refresh');

  if (!current_session.tokens?.refreshToken) {
    logger.error('No refresh token available in session');
    throw new Error('No refresh token available');
  }

  try {
    const newtokens = await refreshAccessToken(config, current_session.tokens.refreshToken);

    const updatedSession = {
      ...current_session,
      tokens: {
        ...current_session.tokens,
        accessToken: newtokens.access_token,
        accessTokenExpiresAt: newtokens.expires_in
          ? new Date(Date.now() + newtokens.expires_in * 1000)
          : undefined,
        refreshToken: newtokens.refresh_token ?? current_session.tokens?.refreshToken,
      },
    };

    logger.info({
      hasNewAccessToken: !!updatedSession.tokens.accessToken,
      hasNewRefreshToken: !!newtokens.refresh_token,
      expiresIn: newtokens.expires_in,
    }, 'Session refreshed successfully');

    return updatedSession;
  } catch (error) {
    // Check if this is an expected invalid_grant error
    const err = error as { code?: string; error?: string; };
    const isInvalidGrant = err?.code === 'OAUTH_RESPONSE_BODY_ERROR' && err?.error === 'invalid_grant';

    if (isInvalidGrant) {
      // Expected error during logout/session expiry - log at info level
      logger.info('Session refresh failed - refresh token expired or invalid');
    } else {
      // Unexpected error - log at error level
      logger.error({ error }, 'Session refresh failed');
    }

    throw error;
  }
};

