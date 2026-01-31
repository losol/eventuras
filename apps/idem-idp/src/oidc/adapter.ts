import type { Adapter, AdapterPayload } from 'oidc-provider';
import { db } from '../db/client';
import { oidcStore } from '../db/schema/oidc';
import { eq, and, lt } from 'drizzle-orm';
import { Logger } from '@eventuras/logger';

const logger = Logger.create({ namespace: 'idem:oidc-adapter' });

/**
 * PostgreSQL adapter for oidc-provider using Drizzle ORM
 * Stores OIDC tokens, codes, and grants in the oidc_store table
 */
export class DrizzleOidcAdapter implements Adapter {
  name: string;

  constructor(name: string) {
    this.name = name;
    logger.debug({ adapterName: name }, 'DrizzleOidcAdapter created');
  }

  /**
   * Insert or update an OIDC entity
   */
  async upsert(id: string, payload: AdapterPayload, expiresIn: number): Promise<void> {
    const expiresAt = new Date(Date.now() + expiresIn * 1000);
    const oidcId = `${this.name}:${id}`;

    // Determine the uid value to store for findByUid() lookups
    // - For DeviceCode: use userCode
    // - For Session: use payload.uid (NOT id!) - this is what isSessionBound mixin looks up
    //   The auth code stores sessionUid = session.uid, so findByUid must find by payload.uid
    // - For Interaction: use the interaction uid (same as id)
    // This enables findByUid() to work for all entity types
    let uidValue: string | null = null;
    if (this.name === 'Session') {
      // CRITICAL: Session.findByUid() is called with the session's uid from the payload
      // NOT the session's id. The auth code references session.uid, not session.id.
      uidValue = payload.uid || id; // Fallback to id if uid not present
      if (!payload.uid) {
        logger.warn({
          id,
          payloadKeys: Object.keys(payload),
        }, 'Session payload has NO uid field - falling back to id. This may cause findByUid failures!');
      }
    } else if (this.name === 'Interaction') {
      uidValue = id;
    } else {
      uidValue = payload.userCode || payload.uid || null;
    }

    try {
      await db
        .insert(oidcStore)
        .values({
          name: this.name,
          oidcId,
          accountId: payload.accountId || null,
          clientId: payload.clientId || null,
          grantId: payload.grantId || null,
          sessionId: payload.sessionUid || payload.uid || null,
          scope: payload.scope || null,
          uid: uidValue,
          payload: payload as any, // JSONB
          expiresAt,
        })
        .onConflictDoUpdate({
          target: [oidcStore.name, oidcStore.oidcId],
          set: {
            accountId: payload.accountId || null,
            clientId: payload.clientId || null,
            grantId: payload.grantId || null,
            sessionId: payload.sessionUid || payload.uid || null,
            scope: payload.scope || null,
            uid: uidValue,
            payload: payload as any,
            expiresAt,
          },
        });

      logger.debug({ name: this.name, id }, 'Upserted OIDC entity');
    } catch (err) {
      logger.error({ err, name: this.name, id }, 'Failed to upsert OIDC entity');
      throw err;
    }
  }

  /**
   * Find an OIDC entity by ID
   *
   * IMPORTANT: Per oidc-provider docs, if an entity is consumed, we must return
   * the payload with a `consumed` property set to the timestamp. This allows
   * the provider to distinguish between "not found" and "already used" for
   * proper error handling (e.g., code replay attack detection).
   */
  async find(id: string): Promise<AdapterPayload | undefined> {
    const oidcId = `${this.name}:${id}`;

    try {
      const [record] = await db
        .select()
        .from(oidcStore)
        .where(and(eq(oidcStore.name, this.name), eq(oidcStore.oidcId, oidcId)))
        .limit(1);

      if (!record) {
        logger.debug({ name: this.name, id }, 'OIDC entity not found');
        return undefined;
      }

      // Check if expired - return undefined for expired entities
      if (record.expiresAt < new Date()) {
        logger.debug({ name: this.name, id }, 'OIDC entity expired');
        return undefined;
      }

      const payload = record.payload as AdapterPayload;

      // If consumed, return payload WITH consumed timestamp (per oidc-provider spec)
      // This allows the provider to detect code replay attacks
      // Spread to ensure plain object (JSONB might return something oidc-provider doesn't accept)
      if (record.consumedAt) {
        logger.debug({ name: this.name, id }, 'OIDC entity already consumed');
        return {
          ...payload,
          consumed: Math.floor(record.consumedAt.getTime() / 1000),
        };
      }

      // Spread to ensure plain object (JSONB might return something oidc-provider doesn't accept)
      return { ...payload };
    } catch (err) {
      logger.error({ err, name: this.name, id }, 'Failed to find OIDC entity');
      throw err;
    }
  }

  /**
   * Find an OIDC entity by user code (device flow)
   */
  async findByUserCode(userCode: string): Promise<AdapterPayload | undefined> {
    try {
      const [record] = await db
        .select()
        .from(oidcStore)
        .where(and(eq(oidcStore.name, this.name), eq(oidcStore.uid, userCode)))
        .limit(1);

      if (!record || record.expiresAt < new Date()) {
        return undefined;
      }

      const payload = record.payload as AdapterPayload;

      // Return with consumed timestamp if consumed
      // Spread to ensure plain object
      if (record.consumedAt) {
        return {
          ...payload,
          consumed: Math.floor(record.consumedAt.getTime() / 1000),
        };
      }

      return { ...payload };
    } catch (err) {
      logger.error({ err, name: this.name, userCode }, 'Failed to find by user code');
      throw err;
    }
  }

  /**
   * Find an OIDC entity by UID
   * This is used by Session.findByUid() which is called by isSessionBound mixin
   *
   * IMPORTANT: For Sessions, this looks up by the session's payload.uid (not id)
   * The authorization code stores sessionUid = session.uid, so this must match
   */
  async findByUid(uid: string): Promise<AdapterPayload | undefined> {
    try {
      const [record] = await db
        .select()
        .from(oidcStore)
        .where(and(eq(oidcStore.name, this.name), eq(oidcStore.uid, uid)))
        .limit(1);

      if (!record) {
        if (this.name === 'Session') {
          logger.warn({ uid }, 'Session not found by uid - authorization code validation will fail');
        }
        return undefined;
      }

      if (record.expiresAt < new Date()) {
        if (this.name === 'Session') {
          logger.warn({ uid, expiresAt: record.expiresAt }, 'Session expired');
        }
        return undefined;
      }

      const payload = record.payload as AdapterPayload;

      // Return with consumed timestamp if consumed
      // Spread to ensure plain object
      if (record.consumedAt) {
        return {
          ...payload,
          consumed: Math.floor(record.consumedAt.getTime() / 1000),
        };
      }

      return { ...payload };
    } catch (err) {
      logger.error({ err, name: this.name, uid }, 'Failed to find by UID');
      throw err;
    }
  }

  /**
   * Mark an OIDC entity as consumed
   */
  async consume(id: string): Promise<void> {
    const oidcId = `${this.name}:${id}`;

    try {
      await db
        .update(oidcStore)
        .set({ consumedAt: new Date() })
        .where(and(eq(oidcStore.name, this.name), eq(oidcStore.oidcId, oidcId)));

      logger.debug({ name: this.name, id }, 'Consumed OIDC entity');
    } catch (err) {
      logger.error({ err, name: this.name, id }, 'Failed to consume OIDC entity');
      throw err;
    }
  }

  /**
   * Destroy an OIDC entity
   */
  async destroy(id: string): Promise<void> {
    const oidcId = `${this.name}:${id}`;

    try {
      await db
        .delete(oidcStore)
        .where(and(eq(oidcStore.name, this.name), eq(oidcStore.oidcId, oidcId)));

      logger.debug({ name: this.name, id }, 'Destroyed OIDC entity');
    } catch (err) {
      logger.error({ err, name: this.name, id }, 'Failed to destroy OIDC entity');
      throw err;
    }
  }

  /**
   * Revoke all tokens for a grant
   */
  async revokeByGrantId(grantId: string): Promise<void> {
    try {
      await db
        .update(oidcStore)
        .set({ consumedAt: new Date() })
        .where(eq(oidcStore.grantId, grantId));

      logger.info({ grantId }, 'Revoked tokens by grant ID');
    } catch (err) {
      logger.error({ err, grantId }, 'Failed to revoke by grant ID');
      throw err;
    }
  }
}

/**
 * Adapter factory function for oidc-provider
 */
export function adapterFactory(name: string): DrizzleOidcAdapter {
  return new DrizzleOidcAdapter(name);
}

/**
 * Prune expired OIDC entities
 * Should be called periodically (e.g., via cron job)
 */
export async function pruneExpiredTokens(): Promise<number> {
  try {
    const deleted = await db
      .delete(oidcStore)
      .where(lt(oidcStore.expiresAt, new Date()))
      .returning({ id: oidcStore.id });

    const count = deleted.length;
    if (count > 0) {
      logger.info({ count }, 'Pruned expired OIDC entities');
    }
    return count;
  } catch (err) {
    logger.error({ err }, 'Failed to prune expired tokens');
    return 0;
  }
}
