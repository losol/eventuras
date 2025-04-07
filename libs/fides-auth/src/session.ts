import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { cache } from 'react';

import type { Session, User } from './db';
import { db, sessionTable, userTable } from './db';
import { decrypt, encrypt, generateToken, sha512 } from './utils';

// Session token generation and validation
export function generateSessionToken(): string {
  return generateToken();
}

interface CreateSessionOptions {
  accessToken?: string;
  refreshToken?: string;
  sessionDurationDays?: number;
}

export async function createSession(
  token: string,
  userId: number,
  { accessToken, refreshToken, sessionDurationDays = 30 }: CreateSessionOptions = {}
): Promise<Session> {
  // Hash the token to create a unique session ID.
  const sessionIdHash = sha512(token);

  const secret = process.env.SESSION_SECRET;

  // Encrypt accessToken/refreshToken only if secret is provided.
  const accessTokenCipher = accessToken && secret ? encrypt(accessToken) : null;
  const refreshTokenCipher = refreshToken && secret ? encrypt(refreshToken) : null;

  // Default session expiry (defaults to 30 days).
  const sessionExpiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * sessionDurationDays);

  const session: Session = {
    id: sessionIdHash,
    userId,
    expiresAt: sessionExpiresAt,
    accessToken: accessTokenCipher,
    refreshToken: refreshTokenCipher,
  };

  await db.insert(sessionTable).values(session);
  return session;
}

export const getCurrentSession = cache(async (): Promise<SessionValidationResult> => {
  const secret = process.env.SESSION_SECRET;

  const token = cookies().get('session')?.value ?? null;
  if (token === null) {
    return { session: null, user: null };
  }
  const result = await validateSessionToken(token);
  return result;
});

export async function validateSessionToken(token: string): Promise<SessionValidationResult> {
  const secret = process.env.SESSION_SECRET;
  const sessionId = sha512(token);
  const result = await db
    .select({ user: userTable, session: sessionTable })
    .from(sessionTable)
    .innerJoin(userTable, eq(sessionTable.userId, userTable.id))
    .where(eq(sessionTable.id, sessionId));

  if (result.length === 0) {
    return { session: null, user: null };
  }

  const sessionData = result[0]!;
  const user = sessionData.user as User;
  const session = sessionData.session as Session;

  // Check if the session is expired
  if (Date.now() >= session.expiresAt.getTime()) {
    await db.delete(sessionTable).where(eq(sessionTable.id, session.id));
    return { session: null, user: null };
  }

  // Renew session if it's within 15 days of expiring
  if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
    session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
    await db
      .update(sessionTable)
      .set({
        expiresAt: session.expiresAt,
      })
      .where(eq(sessionTable.id, session.id));
  }

  // decrypt accessToken/refreshToken if they exist
  if (session.accessToken) {
    session.accessToken = decrypt(session.accessToken);
  }
  if (session.refreshToken) {
    session.refreshToken = decrypt(session.refreshToken);
  }
  // Log the session for debugging
  // eslint-disable-next-line no-console
  console.log('Session:', session);

  return { session, user };
}

export async function invalidateSession(sessionId: string): Promise<void> {
  await db.delete(sessionTable).where(eq(sessionTable.id, sessionId));
}

export async function invalidateAllSessions(userId: number): Promise<void> {
  await db.delete(sessionTable).where(eq(sessionTable.userId, userId));
}

// Session token cookie management
export function setSessionTokenCookie(token: string, expiresAt: Date): void {
  cookies().set('session', token, {
    httpOnly: true,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
  });
}

export function deleteSessionTokenCookie(): void {
  cookies().set('session', '', {
    httpOnly: true,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
  });
}

export type SessionValidationResult =
  | { session: Session; user: User; }
  | { session: null; user: null; };
