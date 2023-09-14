import { AuthOptions } from 'next-auth';
import Auth0Provider from 'next-auth/providers/auth0';

import Logger from './Logger';

export const authOptions: AuthOptions = {
  providers: [
    Auth0Provider({
      id: 'auth0',
      clientId: process.env.AUTH0_CLIENT_ID!,
      clientSecret: process.env.AUTH0_CLIENT_SECRET!,
      issuer: `https://${process.env.NEXT_PUBLIC_AUTH0_DOMAIN}`,
      wellKnown: `https://${process.env.NEXT_PUBLIC_AUTH0_DOMAIN}/.well-known/openid-configuration`,
      authorization: {
        params: {
          audience: process.env.AUTH0_AUDIENCE,
          scope: 'openid email profile offline_access',
        },
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
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
