import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_users_tenants_roles" AS ENUM('site-admin', 'site-member');
  ALTER TYPE "public"."enum_users_roles" ADD VALUE 'system-admin' BEFORE 'user';
  CREATE TABLE IF NOT EXISTS "users_tenants_roles" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_users_tenants_roles",
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "users_tenants" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"tenant_id" uuid NOT NULL
  );
  
  ALTER TABLE "articles_rels" DROP CONSTRAINT "articles_rels_websites_fk";
  
  ALTER TABLE "_articles_v_rels" DROP CONSTRAINT "_articles_v_rels_websites_fk";
  
  ALTER TABLE "happenings_rels" DROP CONSTRAINT "happenings_rels_websites_fk";
  
  ALTER TABLE "notes_rels" DROP CONSTRAINT "notes_rels_websites_fk";
  
  ALTER TABLE "pages_rels" DROP CONSTRAINT "pages_rels_websites_fk";
  
  ALTER TABLE "_pages_v_rels" DROP CONSTRAINT "_pages_v_rels_websites_fk";
  
  ALTER TABLE "projects_rels" DROP CONSTRAINT "projects_rels_websites_fk";
  
  ALTER TABLE "_projects_v_rels" DROP CONSTRAINT "_projects_v_rels_websites_fk";
  
  DROP INDEX IF EXISTS "articles_rels_websites_id_idx";
  DROP INDEX IF EXISTS "_articles_v_rels_websites_id_idx";
  DROP INDEX IF EXISTS "happenings_rels_websites_id_idx";
  DROP INDEX IF EXISTS "notes_rels_websites_id_idx";
  DROP INDEX IF EXISTS "pages_rels_websites_id_idx";
  DROP INDEX IF EXISTS "_pages_v_rels_websites_id_idx";
  DROP INDEX IF EXISTS "projects_rels_websites_id_idx";
  DROP INDEX IF EXISTS "_projects_v_rels_websites_id_idx";
  ALTER TABLE "articles" ADD COLUMN "tenant_id" uuid;
  ALTER TABLE "_articles_v" ADD COLUMN "version_tenant_id" uuid;
  ALTER TABLE "happenings" ADD COLUMN "tenant_id" uuid;
  ALTER TABLE "notes" ADD COLUMN "tenant_id" uuid;
  ALTER TABLE "pages" ADD COLUMN "tenant_id" uuid;
  ALTER TABLE "_pages_v" ADD COLUMN "version_tenant_id" uuid;
  ALTER TABLE "places" ADD COLUMN "tenant_id" uuid;
  ALTER TABLE "projects" ADD COLUMN "tenant_id" uuid;
  ALTER TABLE "_projects_v" ADD COLUMN "version_tenant_id" uuid;
  ALTER TABLE "topics" ADD COLUMN "tenant_id" uuid;
  ALTER TABLE "forms_blocks_select" ADD COLUMN "placeholder" varchar;
  DO $$ BEGIN
   ALTER TABLE "users_tenants_roles" ADD CONSTRAINT "users_tenants_roles_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users_tenants"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "users_tenants" ADD CONSTRAINT "users_tenants_tenant_id_websites_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."websites"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "users_tenants" ADD CONSTRAINT "users_tenants_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "users_tenants_roles_order_idx" ON "users_tenants_roles" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "users_tenants_roles_parent_idx" ON "users_tenants_roles" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "users_tenants_order_idx" ON "users_tenants" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "users_tenants_parent_id_idx" ON "users_tenants" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "users_tenants_tenant_idx" ON "users_tenants" USING btree ("tenant_id");
  DO $$ BEGIN
   ALTER TABLE "articles" ADD CONSTRAINT "articles_tenant_id_websites_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."websites"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_articles_v" ADD CONSTRAINT "_articles_v_version_tenant_id_websites_id_fk" FOREIGN KEY ("version_tenant_id") REFERENCES "public"."websites"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "happenings" ADD CONSTRAINT "happenings_tenant_id_websites_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."websites"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "notes" ADD CONSTRAINT "notes_tenant_id_websites_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."websites"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "pages" ADD CONSTRAINT "pages_tenant_id_websites_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."websites"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_tenant_id_websites_id_fk" FOREIGN KEY ("version_tenant_id") REFERENCES "public"."websites"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "places" ADD CONSTRAINT "places_tenant_id_websites_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."websites"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "projects" ADD CONSTRAINT "projects_tenant_id_websites_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."websites"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_projects_v" ADD CONSTRAINT "_projects_v_version_tenant_id_websites_id_fk" FOREIGN KEY ("version_tenant_id") REFERENCES "public"."websites"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "topics" ADD CONSTRAINT "topics_tenant_id_websites_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."websites"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "articles_tenant_idx" ON "articles" USING btree ("tenant_id");
  CREATE INDEX IF NOT EXISTS "_articles_v_version_version_tenant_idx" ON "_articles_v" USING btree ("version_tenant_id");
  CREATE INDEX IF NOT EXISTS "happenings_tenant_idx" ON "happenings" USING btree ("tenant_id");
  CREATE INDEX IF NOT EXISTS "notes_tenant_idx" ON "notes" USING btree ("tenant_id");
  CREATE INDEX IF NOT EXISTS "pages_tenant_idx" ON "pages" USING btree ("tenant_id");
  CREATE INDEX IF NOT EXISTS "_pages_v_version_version_tenant_idx" ON "_pages_v" USING btree ("version_tenant_id");
  CREATE INDEX IF NOT EXISTS "places_tenant_idx" ON "places" USING btree ("tenant_id");
  CREATE INDEX IF NOT EXISTS "projects_tenant_idx" ON "projects" USING btree ("tenant_id");
  CREATE INDEX IF NOT EXISTS "_projects_v_version_version_tenant_idx" ON "_projects_v" USING btree ("version_tenant_id");
  CREATE INDEX IF NOT EXISTS "topics_tenant_idx" ON "topics" USING btree ("tenant_id");
  ALTER TABLE "articles_rels" DROP COLUMN IF EXISTS "websites_id";
  ALTER TABLE "_articles_v_rels" DROP COLUMN IF EXISTS "websites_id";
  ALTER TABLE "happenings_rels" DROP COLUMN IF EXISTS "websites_id";
  ALTER TABLE "notes_rels" DROP COLUMN IF EXISTS "websites_id";
  ALTER TABLE "pages_rels" DROP COLUMN IF EXISTS "websites_id";
  ALTER TABLE "_pages_v_rels" DROP COLUMN IF EXISTS "websites_id";
  ALTER TABLE "projects_rels" DROP COLUMN IF EXISTS "websites_id";
  ALTER TABLE "_projects_v_rels" DROP COLUMN IF EXISTS "websites_id";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "users_tenants_roles" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "users_tenants" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "users_tenants_roles" CASCADE;
  DROP TABLE "users_tenants" CASCADE;
  ALTER TABLE "articles" DROP CONSTRAINT "articles_tenant_id_websites_id_fk";
  
  ALTER TABLE "_articles_v" DROP CONSTRAINT "_articles_v_version_tenant_id_websites_id_fk";
  
  ALTER TABLE "happenings" DROP CONSTRAINT "happenings_tenant_id_websites_id_fk";
  
  ALTER TABLE "notes" DROP CONSTRAINT "notes_tenant_id_websites_id_fk";
  
  ALTER TABLE "pages" DROP CONSTRAINT "pages_tenant_id_websites_id_fk";
  
  ALTER TABLE "_pages_v" DROP CONSTRAINT "_pages_v_version_tenant_id_websites_id_fk";
  
  ALTER TABLE "places" DROP CONSTRAINT "places_tenant_id_websites_id_fk";
  
  ALTER TABLE "projects" DROP CONSTRAINT "projects_tenant_id_websites_id_fk";
  
  ALTER TABLE "_projects_v" DROP CONSTRAINT "_projects_v_version_tenant_id_websites_id_fk";
  
  ALTER TABLE "topics" DROP CONSTRAINT "topics_tenant_id_websites_id_fk";
  
  DROP INDEX IF EXISTS "articles_tenant_idx";
  DROP INDEX IF EXISTS "_articles_v_version_version_tenant_idx";
  DROP INDEX IF EXISTS "happenings_tenant_idx";
  DROP INDEX IF EXISTS "notes_tenant_idx";
  DROP INDEX IF EXISTS "pages_tenant_idx";
  DROP INDEX IF EXISTS "_pages_v_version_version_tenant_idx";
  DROP INDEX IF EXISTS "places_tenant_idx";
  DROP INDEX IF EXISTS "projects_tenant_idx";
  DROP INDEX IF EXISTS "_projects_v_version_version_tenant_idx";
  DROP INDEX IF EXISTS "topics_tenant_idx";
  ALTER TABLE "articles_rels" ADD COLUMN "websites_id" uuid;
  ALTER TABLE "_articles_v_rels" ADD COLUMN "websites_id" uuid;
  ALTER TABLE "happenings_rels" ADD COLUMN "websites_id" uuid;
  ALTER TABLE "notes_rels" ADD COLUMN "websites_id" uuid;
  ALTER TABLE "pages_rels" ADD COLUMN "websites_id" uuid;
  ALTER TABLE "_pages_v_rels" ADD COLUMN "websites_id" uuid;
  ALTER TABLE "projects_rels" ADD COLUMN "websites_id" uuid;
  ALTER TABLE "_projects_v_rels" ADD COLUMN "websites_id" uuid;
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
   ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_websites_fk" FOREIGN KEY ("websites_id") REFERENCES "public"."websites"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_websites_fk" FOREIGN KEY ("websites_id") REFERENCES "public"."websites"("id") ON DELETE cascade ON UPDATE no action;
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
  
  CREATE INDEX IF NOT EXISTS "articles_rels_websites_id_idx" ON "articles_rels" USING btree ("websites_id");
  CREATE INDEX IF NOT EXISTS "_articles_v_rels_websites_id_idx" ON "_articles_v_rels" USING btree ("websites_id");
  CREATE INDEX IF NOT EXISTS "happenings_rels_websites_id_idx" ON "happenings_rels" USING btree ("websites_id");
  CREATE INDEX IF NOT EXISTS "notes_rels_websites_id_idx" ON "notes_rels" USING btree ("websites_id");
  CREATE INDEX IF NOT EXISTS "pages_rels_websites_id_idx" ON "pages_rels" USING btree ("websites_id");
  CREATE INDEX IF NOT EXISTS "_pages_v_rels_websites_id_idx" ON "_pages_v_rels" USING btree ("websites_id");
  CREATE INDEX IF NOT EXISTS "projects_rels_websites_id_idx" ON "projects_rels" USING btree ("websites_id");
  CREATE INDEX IF NOT EXISTS "_projects_v_rels_websites_id_idx" ON "_projects_v_rels" USING btree ("websites_id");
  ALTER TABLE "articles" DROP COLUMN IF EXISTS "tenant_id";
  ALTER TABLE "_articles_v" DROP COLUMN IF EXISTS "version_tenant_id";
  ALTER TABLE "happenings" DROP COLUMN IF EXISTS "tenant_id";
  ALTER TABLE "notes" DROP COLUMN IF EXISTS "tenant_id";
  ALTER TABLE "pages" DROP COLUMN IF EXISTS "tenant_id";
  ALTER TABLE "_pages_v" DROP COLUMN IF EXISTS "version_tenant_id";
  ALTER TABLE "places" DROP COLUMN IF EXISTS "tenant_id";
  ALTER TABLE "projects" DROP COLUMN IF EXISTS "tenant_id";
  ALTER TABLE "_projects_v" DROP COLUMN IF EXISTS "version_tenant_id";
  ALTER TABLE "topics" DROP COLUMN IF EXISTS "tenant_id";
  ALTER TABLE "forms_blocks_select" DROP COLUMN IF EXISTS "placeholder";
  ALTER TABLE "public"."users_roles" ALTER COLUMN "value" SET DATA TYPE text;
  DROP TYPE "public"."enum_users_roles";
  CREATE TYPE "public"."enum_users_roles" AS ENUM('admin', 'user');
  ALTER TABLE "public"."users_roles" ALTER COLUMN "value" SET DATA TYPE "public"."enum_users_roles" USING "value"::"public"."enum_users_roles";
  DROP TYPE "public"."enum_users_tenants_roles";`)
}
