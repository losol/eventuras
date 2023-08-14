import { AuthOptions } from 'next-auth';
import Auth0Provider from 'next-auth/providers/auth0';

export const authOptions: AuthOptions = {
  providers: [
    Auth0Provider({
      id: 'auth0',
      clientId: process.env.AUTH0_CLIENT_ID!,
      clientSecret: process.env.AUTH0_CLIENT_SECRET!,
      issuer: `https://${process.env.AUTH0_DOMAIN}`,
      wellKnown: `https://${process.env.AUTH0_DOMAIN}/.well-known/openid-configuration`,
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
 
    async jwt({ token, user, account }: { token: any; user: any; account: any }) {
      // Initial sign in
      if (account && user) {
        if (!account.refresh_token) {
          console.error('No refresh token in account object :(');
        }
        console.log({ user, account });
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
