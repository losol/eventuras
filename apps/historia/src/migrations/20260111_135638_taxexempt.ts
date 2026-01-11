import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "orders" ADD COLUMN "tax_exempt" boolean DEFAULT false;
  ALTER TABLE "orders" ADD COLUMN "tax_exempt_reason" varchar;`)
}

/**
 * WARNING: Rolling back this migration will result in data loss.
 * Any orders marked as tax exempt will lose their tax exemption status and reason.
 */
export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "orders" DROP COLUMN "tax_exempt";
  ALTER TABLE "orders" DROP COLUMN "tax_exempt_reason";`)
}
