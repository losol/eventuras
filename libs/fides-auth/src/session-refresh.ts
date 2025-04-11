import { OAuthConfig, refreshAccesstoken } from "./oauth";
import { CreateSessionOptions, Session } from "./session";

export const refreshSession = async (current_session: Session, config: OAuthConfig, options: CreateSessionOptions = {}): Promise<Session | null> => {

  const newtokens = await refreshAccesstoken(config, current_session.tokens?.refreshToken ?? '');

  console.log('refreshsession-newtokens', newtokens);

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

  console.log('updatedSession', updatedSession);

  return updatedSession;
};

