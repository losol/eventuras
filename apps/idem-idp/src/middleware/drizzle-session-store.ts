import { Store, SessionData } from 'express-session';
import { db } from '../db/client';
import { expressSessions } from '../db/schema/oidc';
import { eq, lt } from 'drizzle-orm';
import { Logger } from '@eventuras/logger';

const logger = Logger.create({ namespace: 'idem:session-store' });

/**
 * Drizzle-based session store for express-session
 * Stores sessions in the express_sessions table using Drizzle ORM
 */
export class DrizzleSessionStore extends Store {
  /**
   * Get a session by ID
   */
  async get(sid: string, callback: (err?: any, session?: SessionData | null) => void): Promise<void> {
    try {
      const [row] = await db
        .select()
        .from(expressSessions)
        .where(eq(expressSessions.sid, sid))
        .limit(1);

      if (!row) {
        return callback(null, null);
      }

      // Check if expired
      if (row.expire < new Date()) {
        logger.debug({ sid }, 'Session expired, deleting');
        await this.destroy(sid, () => {});
        return callback(null, null);
      }

      callback(null, row.sess as SessionData);
    } catch (err) {
      logger.error({ err, sid }, 'Failed to get session');
      callback(err);
    }
  }

  /**
   * Set/update a session
   */
  async set(sid: string, session: SessionData, callback?: (err?: any) => void): Promise<void> {
    try {
      const expire = this.getExpireDate(session);
      const sess = session as any; // Cast to any for JSONB

      await db
        .insert(expressSessions)
        .values({ sid, sess, expire })
        .onConflictDoUpdate({
          target: expressSessions.sid,
          set: { sess, expire },
        });

      callback?.();
    } catch (err) {
      logger.error({ err, sid }, 'Failed to set session');
      callback?.(err);
    }
  }

  /**
   * Destroy a session
   */
  async destroy(sid: string, callback?: (err?: any) => void): Promise<void> {
    try {
      await db.delete(expressSessions).where(eq(expressSessions.sid, sid));
      callback?.();
    } catch (err) {
      logger.error({ err, sid }, 'Failed to destroy session');
      callback?.(err);
    }
  }

  /**
   * Touch a session to update expiry
   */
  async touch(sid: string, session: SessionData, callback?: (err?: any) => void): Promise<void> {
    try {
      const expire = this.getExpireDate(session);

      await db
        .update(expressSessions)
        .set({ expire })
        .where(eq(expressSessions.sid, sid));

      callback?.();
    } catch (err) {
      logger.error({ err, sid }, 'Failed to touch session');
      callback?.(err);
    }
  }

  /**
   * Get total number of sessions
   */
  async length(callback: (err: any, length?: number) => void): Promise<void> {
    try {
      const result = await db
        .select({ count: expressSessions.sid })
        .from(expressSessions);

      callback(null, result.length);
    } catch (err) {
      logger.error({ err }, 'Failed to get session count');
      callback(err);
    }
  }

  /**
   * Clear all sessions
   */
  async clear(callback?: (err?: any) => void): Promise<void> {
    try {
      await db.delete(expressSessions);
      logger.info('Cleared all sessions');
      callback?.();
    } catch (err) {
      logger.error({ err }, 'Failed to clear sessions');
      callback?.(err);
    }
  }

  /**
   * Prune expired sessions
   */
  async prune(): Promise<number> {
    try {
      const deleted = await db
        .delete(expressSessions)
        .where(lt(expressSessions.expire, new Date()))
        .returning({ sid: expressSessions.sid });

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
  private getExpireDate(session: any): Date {
    const maxAge = session.cookie?.maxAge;
    if (maxAge) {
      return new Date(Date.now() + maxAge);
    }
    // Default to 24 hours if no maxAge set
    return new Date(Date.now() + 24 * 60 * 60 * 1000);
  }
}
