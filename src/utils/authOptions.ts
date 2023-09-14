import { AuthOptions } from 'next-auth';
import Auth0Provider from 'next-auth/providers/auth0';

import Environment, { EnvironmentVariables } from './Environment';
import Logger from './Logger';

export const authOptions: AuthOptions = {
  providers: [
    Auth0Provider({
      id: 'auth0',
      clientId: Environment.get(EnvironmentVariables.AUTH0_CLIENT_ID),
      clientSecret: Environment.get(EnvironmentVariables.AUTH0_CLIENT_SECRET),
      issuer: `https://${Environment.NEXT_PUBLIC_AUTH0_DOMAIN}`,
      wellKnown: `https://${Environment.NEXT_PUBLIC_AUTH0_DOMAIN}/.well-known/openid-configuration`,
      authorization: {
        params: {
          audience: Environment.get(EnvironmentVariables.AUTH0_API_AUDIENCE),
          scope: 'openid email profile offline_access',
        },
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  secret: Environment.get(EnvironmentVariables.NEXTAUTH_SECRET),
  callbacks: {
    async session({ session, token }) {
      return { ...session, id_token: token.id_token };
    },
    async jwt({ token, user, account }: { token: any; user: any; account: any }) {
      if (account) {
        Logger.info({ namespace: 'auth', developerOnly: true }, { token, user, account });
        token = Object.assign({}, token, {
          access_token: account.access_token,
          id_token: account.id_token,
        });
      }

      if (account && user) {
        if (!account.refresh_token) {
          Logger.error({ namespace: 'auth' }, 'No refresh token in account object :(');
        }
        return {
          ...token,
          refreshToken: account.refresh_token,
          accessTokenExpires: account.expires_at * 1000,
          user,
        };
      }
      //by default, return token
      return token;
    },
  },
};
