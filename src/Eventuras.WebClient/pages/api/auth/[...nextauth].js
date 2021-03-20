import NextAuth from "next-auth";
import Providers from "next-auth/providers";

const nextOptions = {
  providers: [
    Providers.Auth0({
      clientId: process.env.AUTH0_CLIENT_ID,
      clientSecret: process.env.AUTH0_CLIENT_SECRET,
      domain: process.env.AUTH0_DOMAIN,
      audience: "https://eventuras/api",
      scope: "openid profile email registrations:read",
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    jwt: true,
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
  },
  callbacks: {
    async jwt(token, account) {
      if (account?.access_token) {
        token.access_token = account.access_token;
      }
      return token;
    },
    async session(session, token) {
      if (token?.access_token) {
        session.access_token = token.access_token;
      }
      return session;
    },
  },
};

export default (req, res) => NextAuth(req, res, nextOptions);
