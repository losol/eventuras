// Tenant table
import { pgTable, uuid, text, boolean, timestamp, index, uniqueIndex, pgEnum } from 'drizzle-orm/pg-core';
import { organizations } from './core.org';

// Env enum
export const tenantEnv = pgEnum('tenant_env', ['production', 'staging', 'development']);

/** Tenant (issuer domain inside an org) */
export const tenants = pgTable('idem_tenants', {
  // UUID v7 (generate app-side)
  id: uuid('id').primaryKey(),
  // FK to org
  orgId: uuid('org_id').notNull().references(() => organizations.id),
  // Public issuer URL
  issuer: text('issuer').notNull(),
  // Host alias
  host: text('host').notNull(),
  // Environment tag
  environment: tenantEnv('environment').notNull(),
  // Primary tenant for org
  isPrimary: boolean('is_primary').notNull().default(false),
  // Active flag
  active: boolean('active').notNull().default(true),
  // Created at
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (t) => ({
  // Fast filter by org
  idx_tenants_org: index('idx_tenants_org').on(t.orgId),
  // Unique host per tenant
  ux_tenants_host: uniqueIndex('ux_tenants_host').on(t.host),
  // Unique issuer per tenant
  ux_tenants_issuer: uniqueIndex('ux_tenants_issuer').on(t.issuer),
  // Org+env lookup
  idx_tenants_org_env: index('idx_tenants_org_env').on(t.orgId, t.environment),
}));
