import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_sources_contributors_role" AS ENUM('author', 'editor', 'translator', 'interviewer', 'interviewee', 'producer', 'contributor');
  CREATE TYPE "public"."enum_sources_identifiers_type" AS ENUM('isbn', 'doi', 'pmid', 'arxiv', 'issn', 'other');
  CREATE TYPE "public"."enum_sources_source_type" AS ENUM('article-journal', 'book', 'chapter', 'report', 'thesis', 'paper-conference', 'webpage', 'article-newspaper', 'legislation');
  CREATE TABLE "quotes" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"title" varchar,
  	"author_id" uuid,
  	"source_id" uuid,
  	"resource_id" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "quotes_locales" (
  	"quote" jsonb NOT NULL,
  	"attribution_text" varchar,
  	"locator" varchar,
  	"context" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" uuid NOT NULL
  );
  
  CREATE TABLE "sources_contributors" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"role" "enum_sources_contributors_role" DEFAULT 'author' NOT NULL
  );
  
  CREATE TABLE "sources_identifiers" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"type" "enum_sources_identifiers_type" NOT NULL,
  	"value" varchar NOT NULL
  );
  
  CREATE TABLE "sources" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"title" varchar NOT NULL,
  	"source_type" "enum_sources_source_type",
  	"publisher" varchar,
  	"published_date" timestamp(3) with time zone,
  	"url" varchar,
  	"accessed_date" timestamp(3) with time zone,
  	"publication_place" varchar,
  	"edition" varchar,
  	"publication_context_container_title" varchar,
  	"publication_context_volume" varchar,
  	"publication_context_issue" varchar,
  	"publication_context_page" varchar,
  	"resource_id" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "sources_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" uuid NOT NULL,
  	"path" varchar NOT NULL,
  	"persons_id" uuid,
  	"organizations_id" uuid,
  	"media_id" uuid
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "quotes_id" uuid;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "sources_id" uuid;
  ALTER TABLE "quotes" ADD CONSTRAINT "quotes_author_id_persons_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."persons"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "quotes" ADD CONSTRAINT "quotes_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "quotes_locales" ADD CONSTRAINT "quotes_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."quotes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sources_contributors" ADD CONSTRAINT "sources_contributors_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sources"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sources_identifiers" ADD CONSTRAINT "sources_identifiers_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sources"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sources_rels" ADD CONSTRAINT "sources_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."sources"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sources_rels" ADD CONSTRAINT "sources_rels_persons_fk" FOREIGN KEY ("persons_id") REFERENCES "public"."persons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sources_rels" ADD CONSTRAINT "sources_rels_organizations_fk" FOREIGN KEY ("organizations_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sources_rels" ADD CONSTRAINT "sources_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "quotes_author_idx" ON "quotes" USING btree ("author_id");
  CREATE INDEX "quotes_source_idx" ON "quotes" USING btree ("source_id");
  CREATE UNIQUE INDEX "quotes_resource_id_idx" ON "quotes" USING btree ("resource_id");
  CREATE INDEX "quotes_updated_at_idx" ON "quotes" USING btree ("updated_at");
  CREATE INDEX "quotes_created_at_idx" ON "quotes" USING btree ("created_at");
  CREATE UNIQUE INDEX "quotes_locales_locale_parent_id_unique" ON "quotes_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "sources_contributors_order_idx" ON "sources_contributors" USING btree ("_order");
  CREATE INDEX "sources_contributors_parent_id_idx" ON "sources_contributors" USING btree ("_parent_id");
  CREATE INDEX "sources_identifiers_order_idx" ON "sources_identifiers" USING btree ("_order");
  CREATE INDEX "sources_identifiers_parent_id_idx" ON "sources_identifiers" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "sources_resource_id_idx" ON "sources" USING btree ("resource_id");
  CREATE INDEX "sources_updated_at_idx" ON "sources" USING btree ("updated_at");
  CREATE INDEX "sources_created_at_idx" ON "sources" USING btree ("created_at");
  CREATE INDEX "sources_rels_order_idx" ON "sources_rels" USING btree ("order");
  CREATE INDEX "sources_rels_parent_idx" ON "sources_rels" USING btree ("parent_id");
  CREATE INDEX "sources_rels_path_idx" ON "sources_rels" USING btree ("path");
  CREATE INDEX "sources_rels_persons_id_idx" ON "sources_rels" USING btree ("persons_id");
  CREATE INDEX "sources_rels_organizations_id_idx" ON "sources_rels" USING btree ("organizations_id");
  CREATE INDEX "sources_rels_media_id_idx" ON "sources_rels" USING btree ("media_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_quotes_fk" FOREIGN KEY ("quotes_id") REFERENCES "public"."quotes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_sources_fk" FOREIGN KEY ("sources_id") REFERENCES "public"."sources"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_quotes_id_idx" ON "payload_locked_documents_rels" USING btree ("quotes_id");
  CREATE INDEX "payload_locked_documents_rels_sources_id_idx" ON "payload_locked_documents_rels" USING btree ("sources_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "quotes" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "quotes_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "sources_contributors" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "sources_identifiers" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "sources" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "sources_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "quotes" CASCADE;
  DROP TABLE "quotes_locales" CASCADE;
  DROP TABLE "sources_contributors" CASCADE;
  DROP TABLE "sources_identifiers" CASCADE;
  DROP TABLE "sources" CASCADE;
  DROP TABLE "sources_rels" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_quotes_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_sources_fk";
  
  DROP INDEX "payload_locked_documents_rels_quotes_id_idx";
  DROP INDEX "payload_locked_documents_rels_sources_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "quotes_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "sources_id";
  DROP TYPE "public"."enum_sources_contributors_role";
  DROP TYPE "public"."enum_sources_identifiers_type";
  DROP TYPE "public"."enum_sources_source_type";`)
}
