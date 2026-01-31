import type { Session as FastifySession } from 'fastify';
import type { SessionStore } from '@fastify/session';
import { db } from '../db/client';
import { sessions } from '../db/schema/oidc';
import { eq, lt } from 'drizzle-orm';
import { Logger } from '@eventuras/logger';

const logger = Logger.create({ namespace: 'idem:session-store' });

type Callback = (err?: Error | null) => void;
type CallbackSession = (err: Error | null, session?: FastifySession | null) => void;

/**
 * Drizzle-based session store for @fastify/session
 * Stores sessions in the sessions table using Drizzle ORM
 */
export class FastifyDrizzleSessionStore implements SessionStore {
  /**
   * Get a session by ID
   */
  get(sid: string, callback: CallbackSession): void {
    this.getAsync(sid)
      .then((session) => callback(null, session))
      .catch((err) => callback(err as Error));
  }

  private async getAsync(sid: string): Promise<FastifySession | null> {
    const [row] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.sid, sid))
      .limit(1);

    if (!row) {
      return null;
    }

    // Check if expired
    if (row.expire < new Date()) {
      logger.debug({ sid }, 'Session expired, deleting');
      await this.destroyAsync(sid);
      return null;
    }

    return row.sess as FastifySession;
  }

  /**
   * Set/update a session
   */
  set(sid: string, session: FastifySession, callback: Callback): void {
    this.setAsync(sid, session)
      .then(() => callback())
      .catch((err) => callback(err as Error));
  }

  private async setAsync(sid: string, session: FastifySession): Promise<void> {
    const expire = this.getExpireDate(session);

    await db
      .insert(sessions)
      .values({ sid, sess: session, expire })
      .onConflictDoUpdate({
        target: sessions.sid,
        set: { sess: session, expire },
      });
  }

  /**
   * Destroy a session
   */
  destroy(sid: string, callback: Callback): void {
    this.destroyAsync(sid)
      .then(() => callback())
      .catch((err) => callback(err as Error));
  }

  private async destroyAsync(sid: string): Promise<void> {
    await db.delete(sessions).where(eq(sessions.sid, sid));
  }

  /**
   * Prune expired sessions
   */
  async prune(): Promise<number> {
    try {
      const deleted = await db
        .delete(sessions)
        .where(lt(sessions.expire, new Date()))
        .returning({ sid: sessions.sid });

      const count = deleted.length;
      if (count > 0) {
        logger.info({ count }, 'Pruned expired sessions');
      }
      return count;
    } catch (err) {
      logger.error({ err }, 'Failed to prune sessions');
      return 0;
    }
  }

  /**
   * Calculate expiration date from session
   */
  private getExpireDate(session: FastifySession): Date {
    const cookie = session.cookie as { maxAge?: number } | undefined;
    const maxAge = cookie?.maxAge;
    if (maxAge) {
      return new Date(Date.now() + maxAge);
    }
    // Default to 24 hours if no maxAge set
    return new Date(Date.now() + 24 * 60 * 60 * 1000);
  }
}
