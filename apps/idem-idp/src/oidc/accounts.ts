import { db } from '../db/client';
import { accounts } from '../db/schema/account';
import { eq } from 'drizzle-orm';
import { Logger } from '@eventuras/logger';

const logger = Logger.create({ namespace: 'idem:oidc-accounts' });

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

  logger.info({ sub, email: account.primaryEmail }, 'Account found');

  return {
    accountId: account.id,

    /**
     * Return claims for this account based on requested scope
     */
    async claims(use: string, scope: string) {
      logger.debug({ sub, use, scope }, 'Returning claims');

      const claims: Record<string, any> = {
        sub: account.id,
      };

      // Profile claims
      if (scope.includes('profile')) {
        claims.name = account.displayName;
        if (account.givenName) claims.given_name = account.givenName;
        if (account.middleName) claims.middle_name = account.middleName;
        if (account.familyName) claims.family_name = account.familyName;
        if (account.picture) claims.picture = account.picture;
        if (account.locale) claims.locale = account.locale;
        if (account.birthdate) claims.birthdate = account.birthdate;

        // Include system role in profile scope for RBAC
        if (account.systemRole) {
          claims.system_role = account.systemRole;
        }
      }

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
