// user.ts
import { and, eq } from 'drizzle-orm';

import { db, User, userTable } from './db';
import { AuthProvider } from './oauth';

export type UserData = {
  email: string;
  givenName?: string;
  familyName?: string;
  nickname?: string;
  fullName?: string;
  picture?: string;
  emailVerified?: boolean;
  roles?: string[];
};

/**
 * Creates a new user record from any auth provider.
 */
export async function createUser(
  providerName: AuthProvider,
  providerUserId: string,
  userData: UserData
): Promise<User> {
  const [newUser] = await db
    .insert(userTable)
    .values({
      email: userData.email,
      providerName,
      providerUserId,
      givenName: userData.givenName,
      familyName: userData.familyName,
      nickname: userData.nickname,
      fullName: userData.fullName,
      picture: userData.picture,
      emailVerified: userData.emailVerified,
      roles: userData.roles,
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
    .from(userTable)
    .where(
      and(eq(userTable.providerName, providerName), eq(userTable.providerUserId, providerUserId))
    );

  return existingUser ?? null;
}

/**
 * Updates an existing user with new data.
 */
export async function updateUser(
  providerName: AuthProvider,
  providerUserId: string,
  userData: Partial<UserData>
): Promise<User> {
  const [updatedUser] = await db
    .update(userTable)
    .set(userData)
    .where(
      and(eq(userTable.providerName, providerName), eq(userTable.providerUserId, providerUserId))
    )
    .returning();

  if (!updatedUser) {
    throw new Error('User update returned no rows');
  }
  return updatedUser;
}
