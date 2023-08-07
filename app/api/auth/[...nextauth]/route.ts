import { AuthOptions, CookiesOptions } from 'next-auth/core/types';
import NextAuth from 'next-auth/next';
import Auth0Provider from 'next-auth/providers/auth0';

const AUTH0_TOKEN_URL = `https://${process.env.AUTH0_DOMAIN}/oauth/token?`;

const cookies: Partial<CookiesOptions> = {
  sessionToken: {
    name: `next-auth.session-token`,
    options: {
      httpOnly: true,
      sameSite: 'none',
      path: '/',
      domain: process.env.NEXT_PUBLIC_DOMAIN,
      secure: true,
    },
  },
};
export const authOptions: AuthOptions = {
  session: {
    strategy: 'jwt',
  },
  cookies,
  providers: [
    Auth0Provider({
      clientId: process.env.AUTH0_CLIENT_ID!,
      clientSecret: process.env.AUTH0_CLIENT_SECRET!,
      issuer: `https://${process.env.AUTH0_DOMAIN}`,
      authorization: {
        params: {
          audience: process.env.AUTH0_AUDIENCE,
          scope: 'openid email profile offline_access',
        },
      },
    }),
  ],

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
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          accessTokenExpires: account.expires_at * 1000,
          user,
        };
      }
      //without a refresh token, we cant refresh, make sure it has one and it is expired before asking for one
      if (token.refreshToken && Date.now() > token.accessTokenExpires) {
        return refreshAccessToken(token);
      }

      //by default, return token
      return token;
    },
  },
};

/**
 * Takes a token, and returns a new token with updated
 * `accessToken` and `accessTokenExpires`. If an error occurs,
 * returns the old token and an error property
 * From: https://next-auth.js.org/tutorials/refresh-token-rotation
 */
async function refreshAccessToken(token: any) {
  try {
    const response = await fetch(AUTH0_TOKEN_URL, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      method: 'POST',
      body: new URLSearchParams({
        audience: process.env.AUTH0_AUDIENCE!,
        grant_type: 'refresh_token',
        client_id: process.env.AUTH0_CLIENT_ID!,
        client_secret: process.env.AUTH0_CLIENT_SECRET!,
        refresh_token: token.refreshToken,
        redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback/auth0`,
      }),
    });

    const refreshedTokens = await response.json();
    if (!response.ok) {
      throw refreshedTokens;
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
      // Fall back to old refresh token
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
    };
  } catch (error) {
    return {
      ...token,
      error: 'RefreshAccessTokenError',
    };
  }
}

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
