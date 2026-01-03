import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "carts_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"product_id" varchar NOT NULL,
  	"quantity" numeric DEFAULT 1 NOT NULL
  );
  
  CREATE TABLE "carts" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"tenant_id" uuid,
  	"payment_reference" varchar,
  	"secret" varchar,
  	"customer_id" uuid,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "carts_id" uuid;
  ALTER TABLE "carts_items" ADD CONSTRAINT "carts_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."carts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "carts" ADD CONSTRAINT "carts_tenant_id_websites_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."websites"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "carts" ADD CONSTRAINT "carts_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "carts_items_order_idx" ON "carts_items" USING btree ("_order");
  CREATE INDEX "carts_items_parent_id_idx" ON "carts_items" USING btree ("_parent_id");
  CREATE INDEX "carts_tenant_idx" ON "carts" USING btree ("tenant_id");
  CREATE INDEX "carts_payment_reference_idx" ON "carts" USING btree ("payment_reference");
  CREATE INDEX "carts_secret_idx" ON "carts" USING btree ("secret");
  CREATE INDEX "carts_customer_idx" ON "carts" USING btree ("customer_id");
  CREATE INDEX "carts_updated_at_idx" ON "carts" USING btree ("updated_at");
  CREATE INDEX "carts_created_at_idx" ON "carts" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_carts_fk" FOREIGN KEY ("carts_id") REFERENCES "public"."carts"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_carts_id_idx" ON "payload_locked_documents_rels" USING btree ("carts_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "carts_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "carts" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "carts_items" CASCADE;
  DROP TABLE "carts" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_carts_fk";
  
  DROP INDEX "payload_locked_documents_rels_carts_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "carts_id";`)
}
