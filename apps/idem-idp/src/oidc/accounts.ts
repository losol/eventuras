import { db } from '../db/client';
import { accounts } from '../db/schema/account';
import { oauthClients } from '../db/schema/oauth';
import { clientRoles, roleGrants } from '../db/schema/rbac';
import { eq, and } from 'drizzle-orm';
import { Logger } from '@eventuras/logger';

const logger = Logger.create({ namespace: 'idem:oidc-accounts' });

/**
 * Get roles for an account for a specific OAuth client (ADR 0018)
 *
 * @param accountId - The account UUID
 * @param clientId - The OAuth client_id (e.g., 'idem-admin')
 * @returns Array of role names for this client
 */
async function getRolesForClient(
  accountId: string,
  clientId: string
): Promise<string[]> {
  const results = await db
    .select({
      roleName: clientRoles.roleName,
    })
    .from(roleGrants)
    .innerJoin(clientRoles, eq(roleGrants.clientRoleId, clientRoles.id))
    .innerJoin(oauthClients, eq(clientRoles.oauthClientId, oauthClients.id))
    .where(
      and(eq(roleGrants.accountId, accountId), eq(oauthClients.clientId, clientId))
    );

  return results.map((r) => r.roleName);
}

/**
 * Find account by subject (account ID)
 * Returns oidc-provider compatible account object
 */
export async function findAccount(ctx: any, sub: string) {
  logger.debug({ sub }, 'Looking up account');

  const [account] = await db
    .select()
    .from(accounts)
    .where(eq(accounts.id, sub))
    .limit(1);

  if (!account || !account.active || account.deletedAt) {
    logger.warn({ sub }, 'Account not found or inactive');
    return undefined;
  }

  logger.info(
    {
      sub,
    },
    'Account found for OIDC login'
  );

  return {
    accountId: account.id,

    /**
     * Return claims for this account based on requested scope
     * ADR 0018: Includes per-client roles in the 'roles' claim
     */
    async claims(use: string, scope: string) {
      const claims: Record<string, unknown> = {
        sub: account.id,
      };

      // Get the client_id from the OIDC context
      const clientId = ctx.oidc?.client?.clientId;

      // Profile claims
      if (scope.includes('profile')) {
        claims.name = account.displayName;
        if (account.givenName) claims.given_name = account.givenName;
        if (account.middleName) claims.middle_name = account.middleName;
        if (account.familyName) claims.family_name = account.familyName;
        if (account.picture) claims.picture = account.picture;
        if (account.locale) claims.locale = account.locale;
        if (account.birthdate) claims.birthdate = account.birthdate;

        // ADR 0018: Include per-client roles (always an array, can be empty)
        if (clientId) {
          const roles = await getRolesForClient(account.id, clientId);
          claims.roles = roles;

          logger.debug(
            { sub, clientId, roles },
            'Fetched roles for client'
          );
        } else {
          claims.roles = [];
        }
      }

      logger.info(
        {
          sub,
          email: account.primaryEmail,
          use,
          scope,
          roles: claims.roles,
          claimsReturned: Object.keys(claims),
        },
        'Returning claims for account'
      );

      // Email claims
      if (scope.includes('email')) {
        claims.email = account.primaryEmail;
        claims.email_verified = true; // Primary email is always considered verified
      }

      // Phone claims
      if (scope.includes('phone') && account.phone) {
        claims.phone_number = account.phone;
        claims.phone_number_verified = false; // TODO: Track phone verification
      }

      return claims;
    },
  };
}
