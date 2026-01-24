import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "terms_definitions" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" varchar,
  	"is_primary" boolean DEFAULT false
  );
  
  CREATE TABLE "terms_definitions_locales" (
  	"definition" jsonb NOT NULL,
  	"short_definition" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "terms_synonyms" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"synonym" varchar NOT NULL
  );
  
  CREATE TABLE "terms" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"tenant_id" uuid,
  	"term" varchar NOT NULL,
  	"context" varchar,
  	"title" varchar,
  	"resource_id" varchar NOT NULL,
  	"slug_lock" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "terms_locales" (
  	"slug" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" uuid NOT NULL
  );
  
  CREATE TABLE "terms_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" uuid NOT NULL,
  	"path" varchar NOT NULL,
  	"sources_id" uuid,
  	"terms_id" uuid,
  	"topics_id" uuid
  );
  
  ALTER TABLE "quotes" ADD COLUMN "tenant_id" uuid;
  ALTER TABLE "sources" ADD COLUMN "tenant_id" uuid;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "terms_id" uuid;
  ALTER TABLE "terms_definitions" ADD CONSTRAINT "terms_definitions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."terms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "terms_definitions_locales" ADD CONSTRAINT "terms_definitions_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."terms_definitions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "terms_synonyms" ADD CONSTRAINT "terms_synonyms_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."terms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "terms" ADD CONSTRAINT "terms_tenant_id_websites_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."websites"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "terms_locales" ADD CONSTRAINT "terms_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."terms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "terms_rels" ADD CONSTRAINT "terms_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."terms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "terms_rels" ADD CONSTRAINT "terms_rels_sources_fk" FOREIGN KEY ("sources_id") REFERENCES "public"."sources"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "terms_rels" ADD CONSTRAINT "terms_rels_terms_fk" FOREIGN KEY ("terms_id") REFERENCES "public"."terms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "terms_rels" ADD CONSTRAINT "terms_rels_topics_fk" FOREIGN KEY ("topics_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "terms_definitions_order_idx" ON "terms_definitions" USING btree ("_order");
  CREATE INDEX "terms_definitions_parent_id_idx" ON "terms_definitions" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "terms_definitions_locales_locale_parent_id_unique" ON "terms_definitions_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "terms_synonyms_order_idx" ON "terms_synonyms" USING btree ("_order");
  CREATE INDEX "terms_synonyms_parent_id_idx" ON "terms_synonyms" USING btree ("_parent_id");
  CREATE INDEX "terms_tenant_idx" ON "terms" USING btree ("tenant_id");
  CREATE UNIQUE INDEX "terms_resource_id_idx" ON "terms" USING btree ("resource_id");
  CREATE INDEX "terms_updated_at_idx" ON "terms" USING btree ("updated_at");
  CREATE INDEX "terms_created_at_idx" ON "terms" USING btree ("created_at");
  CREATE INDEX "terms_slug_idx" ON "terms_locales" USING btree ("slug","_locale");
  CREATE UNIQUE INDEX "terms_locales_locale_parent_id_unique" ON "terms_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "terms_rels_order_idx" ON "terms_rels" USING btree ("order");
  CREATE INDEX "terms_rels_parent_idx" ON "terms_rels" USING btree ("parent_id");
  CREATE INDEX "terms_rels_path_idx" ON "terms_rels" USING btree ("path");
  CREATE INDEX "terms_rels_sources_id_idx" ON "terms_rels" USING btree ("sources_id");
  CREATE INDEX "terms_rels_terms_id_idx" ON "terms_rels" USING btree ("terms_id");
  CREATE INDEX "terms_rels_topics_id_idx" ON "terms_rels" USING btree ("topics_id");
  ALTER TABLE "quotes" ADD CONSTRAINT "quotes_tenant_id_websites_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."websites"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "sources" ADD CONSTRAINT "sources_tenant_id_websites_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."websites"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_terms_fk" FOREIGN KEY ("terms_id") REFERENCES "public"."terms"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "quotes_tenant_idx" ON "quotes" USING btree ("tenant_id");
  CREATE INDEX "sources_tenant_idx" ON "sources" USING btree ("tenant_id");
  CREATE INDEX "payload_locked_documents_rels_terms_id_idx" ON "payload_locked_documents_rels" USING btree ("terms_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "terms_definitions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "terms_definitions_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "terms_synonyms" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "terms" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "terms_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "terms_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "terms_definitions" CASCADE;
  DROP TABLE "terms_definitions_locales" CASCADE;
  DROP TABLE "terms_synonyms" CASCADE;
  DROP TABLE "terms" CASCADE;
  DROP TABLE "terms_locales" CASCADE;
  DROP TABLE "terms_rels" CASCADE;
  ALTER TABLE "quotes" DROP CONSTRAINT "quotes_tenant_id_websites_id_fk";
  
  ALTER TABLE "sources" DROP CONSTRAINT "sources_tenant_id_websites_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_terms_fk";
  
  DROP INDEX "quotes_tenant_idx";
  DROP INDEX "sources_tenant_idx";
  DROP INDEX "payload_locked_documents_rels_terms_id_idx";
  ALTER TABLE "quotes" DROP COLUMN "tenant_id";
  ALTER TABLE "sources" DROP COLUMN "tenant_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "terms_id";`)
}
