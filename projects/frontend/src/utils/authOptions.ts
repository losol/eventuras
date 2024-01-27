import { jwtDecode } from 'jwt-decode';
import { AuthOptions } from 'next-auth';
import Auth0Provider from 'next-auth/providers/auth0';

import Environment, { EnvironmentVariables } from './Environment';
import Logger from './Logger';
const loggerNamespace = { developerOnly: true, namespace: 'auth' };
const roleKey = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';
type JWTWithRole = {
  [roleKey]: string[];
};
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
      return { ...session, id_token: token.id_token, roles: token.roles };
    },
    async jwt({ token, user, account }: { token: any; user: any; account: any }) {
      let returnJWT = {
        ...token,
      };
      Logger.info(loggerNamespace, { token, user, account });
      if (account) {
        returnJWT = {
          ...returnJWT,
          access_token: account.access_token,
          id_token: account.id_token,
          refresh_token: account.refresh_token,
        };
      }
      if (user) {
        returnJWT = {
          ...returnJWT,
          user,
        };
      }
      if (returnJWT.refresh_token) {
        const hasExpired = Date.now() > returnJWT.accessTokenExpires;
        if (hasExpired) {
          const refreshReturn = await refreshToken(returnJWT.refresh_token);
          Logger.info(loggerNamespace, { refreshReturn });
          if (refreshReturn) {
            //this will create a union, any variables in refreshReturn will override any in returnJWT
            returnJWT = {
              ...returnJWT,
              ...refreshReturn,
            };
          }
        }
        if (returnJWT.access_token) {
          //for unknown reason the decode function from nextauth throws errors, for now lets use jwtDecode
          const decoded = jwtDecode(returnJWT.access_token) as JWTWithRole;
          returnJWT = {
            ...returnJWT,
            roles: decoded[roleKey],
          };
        }
      } else {
        Logger.warn(loggerNamespace, 'No refresh token!');
      }

      Logger.info(loggerNamespace, { returnJWT, roles: returnJWT.roles });

      //by default, return token
      return returnJWT;
    },
  },
};

type RefreshTokenFetchReturn = {
  access_token: string;
  refresh_token: string;
  id_token: string;
  scope: string;
  expires_in: number;
  token_type: string;
};
/**
 * @see https://auth0.com/docs/secure/tokens/refresh-tokens/use-refresh-tokens
 * @see https://next-auth.js.org/v3/tutorials/refresh-token-rotation
 * @param refresh_token
 * @param access_token
 * @returns RefreshTokenFetchReturn
 */

const refreshToken = async (refresh_token: string): Promise<RefreshTokenFetchReturn | null> => {
  Logger.info(loggerNamespace, 'Token Expired: Attempting to fetch a new token');
  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: Environment.get(EnvironmentVariables.AUTH0_CLIENT_ID),
    client_secret: Environment.get(EnvironmentVariables.AUTH0_CLIENT_SECRET),
    refresh_token: refresh_token,
  });

  const fetchConfig: RequestInit = {
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
    method: 'POST',
    body: params.toString(),
  };
  return fetch(`https://${Environment.NEXT_PUBLIC_AUTH0_DOMAIN}/oauth/token`, fetchConfig)
    .then(r => r.json())
    .then(rJson => {
      if (rJson.error) {
        Logger.error(loggerNamespace, `Error refreshing token: ${rJson.error_description}`);
        return null;
      }
      return rJson;
    })
    .catch(err => {
      Logger.error(loggerNamespace, 'Failed to refresh token', { err });
      return null;
    });
};
