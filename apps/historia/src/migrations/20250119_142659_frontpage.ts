import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_rels" ADD COLUMN "websites_id" uuid;
  ALTER TABLE "_pages_v_rels" ADD COLUMN "websites_id" uuid;
  DO $$ BEGIN
   ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_websites_fk" FOREIGN KEY ("websites_id") REFERENCES "public"."websites"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_websites_fk" FOREIGN KEY ("websites_id") REFERENCES "public"."websites"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "pages_rels_websites_id_idx" ON "pages_rels" USING btree ("websites_id");
  CREATE INDEX IF NOT EXISTS "_pages_v_rels_websites_id_idx" ON "_pages_v_rels" USING btree ("websites_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_rels" DROP CONSTRAINT "pages_rels_websites_fk";
  
  ALTER TABLE "_pages_v_rels" DROP CONSTRAINT "_pages_v_rels_websites_fk";
  
  DROP INDEX IF EXISTS "pages_rels_websites_id_idx";
  DROP INDEX IF EXISTS "_pages_v_rels_websites_id_idx";
  ALTER TABLE "pages_rels" DROP COLUMN IF EXISTS "websites_id";
  ALTER TABLE "_pages_v_rels" DROP COLUMN IF EXISTS "websites_id";`)
}
