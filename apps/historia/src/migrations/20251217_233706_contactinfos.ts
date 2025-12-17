import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_websites_contact_points_contact_type" AS ENUM('editor', 'sales', 'support');
  CREATE TABLE "websites_contact_points" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"user_id" uuid NOT NULL,
  	"contact_type" "enum_websites_contact_points_contact_type" NOT NULL
  );
  
  ALTER TABLE "websites_blocks_internal_link" ALTER COLUMN "text" DROP NOT NULL;
  ALTER TABLE "websites_contact_points" ADD CONSTRAINT "websites_contact_points_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "websites_contact_points" ADD CONSTRAINT "websites_contact_points_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."websites"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "websites_contact_points_order_idx" ON "websites_contact_points" USING btree ("_order");
  CREATE INDEX "websites_contact_points_parent_id_idx" ON "websites_contact_points" USING btree ("_parent_id");
  CREATE INDEX "websites_contact_points_user_idx" ON "websites_contact_points" USING btree ("user_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "websites_contact_points" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "websites_contact_points" CASCADE;
  ALTER TABLE "websites_blocks_internal_link" ALTER COLUMN "text" SET NOT NULL;
  DROP TYPE "public"."enum_websites_contact_points_contact_type";`)
}
