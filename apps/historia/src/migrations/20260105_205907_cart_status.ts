import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_carts_status" AS ENUM('draft', 'payment-initiated', 'completed', 'cancelled');
  ALTER TABLE "carts" ADD COLUMN "status" "enum_carts_status" DEFAULT 'draft' NOT NULL;
  ALTER TABLE "carts" ADD COLUMN "order_id" uuid;
  ALTER TABLE "carts" ADD CONSTRAINT "carts_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "carts_status_idx" ON "carts" USING btree ("status");
  CREATE INDEX "carts_order_idx" ON "carts" USING btree ("order_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "carts" DROP CONSTRAINT "carts_order_id_orders_id_fk";
  
  DROP INDEX "carts_status_idx";
  DROP INDEX "carts_order_idx";
  ALTER TABLE "carts" DROP COLUMN "status";
  ALTER TABLE "carts" DROP COLUMN "order_id";
  DROP TYPE "public"."enum_carts_status";`)
}
