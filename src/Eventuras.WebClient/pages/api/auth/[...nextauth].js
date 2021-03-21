import NextAuth from 'next-auth';
import Providers from 'next-auth/providers';

const nextOptions = {
  site: process.env.NEXTAUTH_URL,
  providers: [
    Providers.Auth0({
      clientId: process.env.AUTH0_CLIENT_ID,
      clientSecret: process.env.AUTH0_CLIENT_SECRET,
      domain: process.env.AUTH0_DOMAIN,
      audience: 'https://eventuras/api',
      scope: 'openid profile email user',
      protection: 'pkce',
      idToken: true,
      authorizationUrl: `https://${
        process.env.AUTH0_DOMAIN
      }/authorize?response_type=code&audience=${encodeURI(
        process.env.AUTH0_API_AUDIENCE
      )}`,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    jwt: true,
    secret: process.env.NEXTAUTH_SECRET,
  },
  callbacks: {
    async jwt(token, user, account, profile, isNewUser) {
      if (account?.accessToken) {
        token.accessToken = account.accessToken;
      }
      return token;
    },

    async session(session, token) {
      session.accessToken = token.accessToken;
      return session;
    },
  },
};

export default (req, res) => NextAuth(req, res, nextOptions);
