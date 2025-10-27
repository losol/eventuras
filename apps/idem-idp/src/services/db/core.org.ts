import { pgTable, uuid, text, boolean, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

export const organizations = pgTable('idem_organizations', {
  id: uuid('id').primaryKey(),
  slug: text('slug').notNull(),
  displayName: text('display_name'),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (t) => ({
  ux_org_slug: uniqueIndex('ux_org_slug').on(t.slug),
}));
