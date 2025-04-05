import { sha256 } from '@oslojs/crypto/sha2';
import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from '@oslojs/encoding';
import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { cache } from 'react';

import type { Session, User } from './db';
import { authUserTable, db, sessionTable } from './db';

// Session token generation and validation
export function generateSessionToken(): string {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  const token = encodeBase32LowerCaseNoPadding(bytes);
  return token;
}

export async function createSession(token: string, userId: number): Promise<Session> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const session: Session = {
    id: sessionId,
    userId,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
  };
  await db.insert(sessionTable).values(session);
  return session;
}

export const getCurrentSession = cache(async (): Promise<SessionValidationResult> => {
  const token = cookies().get('session')?.value ?? null;
  if (token === null) {
    return { session: null, user: null };
  }
  const result = await validateSessionToken(token);
  return result;
});

export async function validateSessionToken(token: string): Promise<SessionValidationResult> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const result = await db
    .select({ user: authUserTable, session: sessionTable })
    .from(sessionTable)
    .innerJoin(authUserTable, eq(sessionTable.userId, authUserTable.id))
    .where(eq(sessionTable.id, sessionId));

  if (result.length === 0) {
    return { session: null, user: null };
  }

  const sessionData = result[0]!;
  const user = sessionData.user as User;
  const session = sessionData.session as Session;

  if (Date.now() >= session.expiresAt.getTime()) {
    await db.delete(sessionTable).where(eq(sessionTable.id, session.id));
    return { session: null, user: null };
  }

  if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
    session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
    await db
      .update(sessionTable)
      .set({
        expiresAt: session.expiresAt,
      })
      .where(eq(sessionTable.id, session.id));
  }

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
  | { session: Session; user: User }
  | { session: null; user: null };
