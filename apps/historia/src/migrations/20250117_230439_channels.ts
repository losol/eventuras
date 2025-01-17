import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE IF NOT EXISTS "websites" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"home_page_id" uuid,
  	"meta_image_id" uuid,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "websites_locales" (
  	"name" varchar NOT NULL,
  	"title" varchar NOT NULL,
  	"summary" varchar,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" uuid NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "websites_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" uuid NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  ALTER TABLE "articles_rels" ADD COLUMN "websites_id" uuid;
  ALTER TABLE "_articles_v_rels" ADD COLUMN "websites_id" uuid;
  ALTER TABLE "happenings_rels" ADD COLUMN "websites_id" uuid;
  ALTER TABLE "notes_rels" ADD COLUMN "websites_id" uuid;
  ALTER TABLE "projects_rels" ADD COLUMN "websites_id" uuid;
  ALTER TABLE "_projects_v_rels" ADD COLUMN "websites_id" uuid;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "websites_id" uuid;
  DO $$ BEGIN
   ALTER TABLE "websites" ADD CONSTRAINT "websites_home_page_id_pages_id_fk" FOREIGN KEY ("home_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "websites" ADD CONSTRAINT "websites_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "websites_locales" ADD CONSTRAINT "websites_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."websites"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "websites_texts" ADD CONSTRAINT "websites_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."websites"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "websites_home_page_idx" ON "websites" USING btree ("home_page_id");
  CREATE INDEX IF NOT EXISTS "websites_meta_meta_image_idx" ON "websites" USING btree ("meta_image_id");
  CREATE INDEX IF NOT EXISTS "websites_updated_at_idx" ON "websites" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "websites_created_at_idx" ON "websites" USING btree ("created_at");
  CREATE UNIQUE INDEX IF NOT EXISTS "websites_locales_locale_parent_id_unique" ON "websites_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX IF NOT EXISTS "websites_texts_order_parent_idx" ON "websites_texts" USING btree ("order","parent_id");
  DO $$ BEGIN
   ALTER TABLE "articles_rels" ADD CONSTRAINT "articles_rels_websites_fk" FOREIGN KEY ("websites_id") REFERENCES "public"."websites"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_articles_v_rels" ADD CONSTRAINT "_articles_v_rels_websites_fk" FOREIGN KEY ("websites_id") REFERENCES "public"."websites"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "happenings_rels" ADD CONSTRAINT "happenings_rels_websites_fk" FOREIGN KEY ("websites_id") REFERENCES "public"."websites"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "notes_rels" ADD CONSTRAINT "notes_rels_websites_fk" FOREIGN KEY ("websites_id") REFERENCES "public"."websites"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "projects_rels" ADD CONSTRAINT "projects_rels_websites_fk" FOREIGN KEY ("websites_id") REFERENCES "public"."websites"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_projects_v_rels" ADD CONSTRAINT "_projects_v_rels_websites_fk" FOREIGN KEY ("websites_id") REFERENCES "public"."websites"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_websites_fk" FOREIGN KEY ("websites_id") REFERENCES "public"."websites"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "articles_rels_websites_id_idx" ON "articles_rels" USING btree ("websites_id");
  CREATE INDEX IF NOT EXISTS "_articles_v_rels_websites_id_idx" ON "_articles_v_rels" USING btree ("websites_id");
  CREATE INDEX IF NOT EXISTS "happenings_rels_websites_id_idx" ON "happenings_rels" USING btree ("websites_id");
  CREATE INDEX IF NOT EXISTS "notes_rels_websites_id_idx" ON "notes_rels" USING btree ("websites_id");
  CREATE INDEX IF NOT EXISTS "projects_rels_websites_id_idx" ON "projects_rels" USING btree ("websites_id");
  CREATE INDEX IF NOT EXISTS "_projects_v_rels_websites_id_idx" ON "_projects_v_rels" USING btree ("websites_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_websites_id_idx" ON "payload_locked_documents_rels" USING btree ("websites_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "websites" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "websites_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "websites_texts" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "websites" CASCADE;
  DROP TABLE "websites_locales" CASCADE;
  DROP TABLE "websites_texts" CASCADE;
  ALTER TABLE "articles_rels" DROP CONSTRAINT "articles_rels_websites_fk";
  
  ALTER TABLE "_articles_v_rels" DROP CONSTRAINT "_articles_v_rels_websites_fk";
  
  ALTER TABLE "happenings_rels" DROP CONSTRAINT "happenings_rels_websites_fk";
  
  ALTER TABLE "notes_rels" DROP CONSTRAINT "notes_rels_websites_fk";
  
  ALTER TABLE "projects_rels" DROP CONSTRAINT "projects_rels_websites_fk";
  
  ALTER TABLE "_projects_v_rels" DROP CONSTRAINT "_projects_v_rels_websites_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_websites_fk";
  
  DROP INDEX IF EXISTS "articles_rels_websites_id_idx";
  DROP INDEX IF EXISTS "_articles_v_rels_websites_id_idx";
  DROP INDEX IF EXISTS "happenings_rels_websites_id_idx";
  DROP INDEX IF EXISTS "notes_rels_websites_id_idx";
  DROP INDEX IF EXISTS "projects_rels_websites_id_idx";
  DROP INDEX IF EXISTS "_projects_v_rels_websites_id_idx";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_websites_id_idx";
  ALTER TABLE "articles_rels" DROP COLUMN IF EXISTS "websites_id";
  ALTER TABLE "_articles_v_rels" DROP COLUMN IF EXISTS "websites_id";
  ALTER TABLE "happenings_rels" DROP COLUMN IF EXISTS "websites_id";
  ALTER TABLE "notes_rels" DROP COLUMN IF EXISTS "websites_id";
  ALTER TABLE "projects_rels" DROP COLUMN IF EXISTS "websites_id";
  ALTER TABLE "_projects_v_rels" DROP COLUMN IF EXISTS "websites_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "websites_id";`)
}
