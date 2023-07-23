import NextAuth from 'next-auth';
import Auth0Provider from 'next-auth/providers/auth0';

const AUTH0_AUTHORIZE_URL =
  `https://${process.env.AUTH0_DOMAIN}/authorize?` +
  new URLSearchParams({
    audience: process.env.AUTH0_API_AUDIENCE,
    response_type: 'code',
  });
const AUTH0_TOKEN_URL = `https://${process.env.AUTH0_DOMAIN}/oauth/token?`;

const nextOptions = {
  site: process.env.NEXTAUTH_URL,
  providers: [
    Auth0Provider({
      clientId: process.env.AUTH0_CLIENT_ID,
      clientSecret: process.env.AUTH0_CLIENT_SECRET,
      issuer: `https://${process.env.AUTH0_DOMAIN}`,
      audience: process.env.AUTH0_API_AUDIENCE,
      scope: 'openid profile email offline_access',
      protection: 'pkce',
      idToken: true,
      refreshToken: true,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    jwt: true,
    secret: process.env.NEXTAUTH_SECRET,
  },
  callbacks: {
    async jwt(token, user, account) {
      // Initial sign in
      if (account && user) {
        return {
          accessToken: account.accessToken,
          accessTokenExpires: Date.now() + account.expires_in * 1000,
          refreshToken: account.refresh_token,
          user,
        };
      }

      // Return previous token if the access token has not expired yet
      if (Date.now() < token.accessTokenExpires) {
        return token;
      }

      // Access token has expired, try to update it
      return refreshAccessToken(token);
    },
    async session(session, token) {
      if (token) {
        session.user = token.user;
        session.user.accessToken = token.accessToken;
        session.error = token.error;
      }

      return session;
    },
  },
};

/**
 * Takes a token, and returns a new token with updated
 * `accessToken` and `accessTokenExpires`. If an error occurs,
 * returns the old token and an error property
 * From: https://next-auth.js.org/tutorials/refresh-token-rotation
 */
async function refreshAccessToken(token) {
  try {
    const response = await fetch(AUTH0_TOKEN_URL, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      method: 'POST',
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: process.env.AUTH0_CLIENT_ID,
        client_secret: process.env.AUTH0_CLIENT_SECRET,
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
    console.log(error);

    return {
      ...token,
      error: 'RefreshAccessTokenError',
    };
  }
}

export default (req, res) => NextAuth(req, res, nextOptions);
