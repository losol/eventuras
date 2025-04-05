// user.ts
import { and, eq } from 'drizzle-orm';

import { authUserTable, db, User } from './db';
import { AuthProvider } from './oauth';

/**
 * Creates a new user record from any auth provider.
 */
export async function createUser(
  providerName: AuthProvider,
  providerUserId: string,
  email: string
): Promise<User> {
  const [newUser] = await db
    .insert(authUserTable)
    .values({
      email,
      providerName,
      providerUserId,
    })
    .returning();

  if (!newUser) {
    throw new Error('User creation returned no rows');
  }
  return newUser;
}

/**
 * Retrieves a user by auth provider name and provider-specific user ID.
 */
export async function getUser(
  providerName: AuthProvider,
  providerUserId: string
): Promise<User | null> {
  const [existingUser] = await db
    .select()
    .from(authUserTable)
    .where(
      and(
        eq(authUserTable.providerName, providerName),
        eq(authUserTable.providerUserId, providerUserId)
      )
    );

  return existingUser ?? null;
}
