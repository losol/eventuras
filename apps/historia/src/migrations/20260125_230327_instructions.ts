import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_instructions_blocks_resources_type" AS ENUM('materials', 'tools');
  CREATE TYPE "public"."enum_instructions_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__instructions_v_blocks_resources_type" AS ENUM('materials', 'tools');
  CREATE TYPE "public"."enum__instructions_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__instructions_v_published_locale" AS ENUM('no', 'en');
  CREATE TYPE "public"."enum_imports_collection_slug" AS ENUM('articles', 'instructions', 'notes', 'pages', 'users', 'orders');
  CREATE TYPE "public"."enum_imports_import_mode" AS ENUM('create', 'update', 'upsert');
  CREATE TYPE "public"."enum_imports_status" AS ENUM('pending', 'completed', 'partial', 'failed');
  ALTER TYPE "public"."enum_payload_jobs_log_task_slug" ADD VALUE 'createCollectionImport';
  ALTER TYPE "public"."enum_payload_jobs_task_slug" ADD VALUE 'createCollectionImport';
  CREATE TABLE "instructions_blocks_content" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "instructions_blocks_content_locales" (
  	"rich_text" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "instructions_blocks_resources_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "instructions_blocks_resources_items_locales" (
  	"name" varchar,
  	"description" jsonb,
  	"quantity" varchar,
  	"unit" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "instructions_blocks_resources" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"type" "enum_instructions_blocks_resources_type" DEFAULT 'materials',
  	"block_name" varchar
  );
  
  CREATE TABLE "instructions_blocks_resources_locales" (
  	"title" varchar,
  	"description" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "instructions_blocks_instruction" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_media_id" uuid,
  	"block_name" varchar
  );
  
  CREATE TABLE "instructions_blocks_instruction_locales" (
  	"title" varchar,
  	"image_caption" jsonb,
  	"content" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "instructions_blocks_instruction_section" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "instructions_blocks_instruction_section_locales" (
  	"title" varchar,
  	"description" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "instructions" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"tenant_id" uuid,
  	"image_media_id" uuid,
  	"published_at" timestamp(3) with time zone,
  	"slug_lock" boolean DEFAULT true,
  	"resource_id" varchar,
  	"config" jsonb,
  	"meta_image_id" uuid,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_instructions_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "instructions_locales" (
  	"title" varchar,
  	"lead" varchar,
  	"image_caption" jsonb,
  	"slug" varchar,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" uuid NOT NULL
  );
  
  CREATE TABLE "_instructions_v_blocks_content" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"_path" text NOT NULL,
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_instructions_v_blocks_content_locales" (
  	"rich_text" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" uuid NOT NULL
  );
  
  CREATE TABLE "_instructions_v_blocks_resources_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_instructions_v_blocks_resources_items_locales" (
  	"name" varchar,
  	"description" jsonb,
  	"quantity" varchar,
  	"unit" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" uuid NOT NULL
  );
  
  CREATE TABLE "_instructions_v_blocks_resources" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"_path" text NOT NULL,
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"type" "enum__instructions_v_blocks_resources_type" DEFAULT 'materials',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_instructions_v_blocks_resources_locales" (
  	"title" varchar,
  	"description" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" uuid NOT NULL
  );
  
  CREATE TABLE "_instructions_v_blocks_instruction" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"_path" text NOT NULL,
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"image_media_id" uuid,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_instructions_v_blocks_instruction_locales" (
  	"title" varchar,
  	"image_caption" jsonb,
  	"content" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" uuid NOT NULL
  );
  
  CREATE TABLE "_instructions_v_blocks_instruction_section" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"_path" text NOT NULL,
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_instructions_v_blocks_instruction_section_locales" (
  	"title" varchar,
  	"description" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" uuid NOT NULL
  );
  
  CREATE TABLE "_instructions_v" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"parent_id" uuid,
  	"version_tenant_id" uuid,
  	"version_image_media_id" uuid,
  	"version_published_at" timestamp(3) with time zone,
  	"version_slug_lock" boolean DEFAULT true,
  	"version_resource_id" varchar,
  	"version_config" jsonb,
  	"version_meta_image_id" uuid,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__instructions_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__instructions_v_published_locale",
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_instructions_v_locales" (
  	"version_title" varchar,
  	"version_lead" varchar,
  	"version_image_caption" jsonb,
  	"version_slug" varchar,
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" uuid NOT NULL
  );
  
  CREATE TABLE "imports" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"collection_slug" "enum_imports_collection_slug" NOT NULL,
  	"import_mode" "enum_imports_import_mode",
  	"match_field" varchar DEFAULT 'id',
  	"status" "enum_imports_status" DEFAULT 'pending',
  	"summary_imported" numeric,
  	"summary_updated" numeric,
  	"summary_total" numeric,
  	"summary_issues" numeric,
  	"summary_issue_details" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_exports_fk";
  
  DROP INDEX "payload_locked_documents_rels_exports_id_idx";
  ALTER TABLE "users" ADD COLUMN "enable_a_p_i_key" boolean;
  ALTER TABLE "users" ADD COLUMN "api_key" varchar;
  ALTER TABLE "users" ADD COLUMN "api_key_index" varchar;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "instructions_id" uuid;
  ALTER TABLE "instructions_blocks_content" ADD CONSTRAINT "instructions_blocks_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."instructions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "instructions_blocks_content_locales" ADD CONSTRAINT "instructions_blocks_content_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."instructions_blocks_content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "instructions_blocks_resources_items" ADD CONSTRAINT "instructions_blocks_resources_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."instructions_blocks_resources"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "instructions_blocks_resources_items_locales" ADD CONSTRAINT "instructions_blocks_resources_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."instructions_blocks_resources_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "instructions_blocks_resources" ADD CONSTRAINT "instructions_blocks_resources_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."instructions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "instructions_blocks_resources_locales" ADD CONSTRAINT "instructions_blocks_resources_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."instructions_blocks_resources"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "instructions_blocks_instruction" ADD CONSTRAINT "instructions_blocks_instruction_image_media_id_media_id_fk" FOREIGN KEY ("image_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "instructions_blocks_instruction" ADD CONSTRAINT "instructions_blocks_instruction_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."instructions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "instructions_blocks_instruction_locales" ADD CONSTRAINT "instructions_blocks_instruction_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."instructions_blocks_instruction"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "instructions_blocks_instruction_section" ADD CONSTRAINT "instructions_blocks_instruction_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."instructions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "instructions_blocks_instruction_section_locales" ADD CONSTRAINT "instructions_blocks_instruction_section_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."instructions_blocks_instruction_section"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "instructions" ADD CONSTRAINT "instructions_tenant_id_websites_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."websites"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "instructions" ADD CONSTRAINT "instructions_image_media_id_media_id_fk" FOREIGN KEY ("image_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "instructions" ADD CONSTRAINT "instructions_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "instructions_locales" ADD CONSTRAINT "instructions_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."instructions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_instructions_v_blocks_content" ADD CONSTRAINT "_instructions_v_blocks_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_instructions_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_instructions_v_blocks_content_locales" ADD CONSTRAINT "_instructions_v_blocks_content_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_instructions_v_blocks_content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_instructions_v_blocks_resources_items" ADD CONSTRAINT "_instructions_v_blocks_resources_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_instructions_v_blocks_resources"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_instructions_v_blocks_resources_items_locales" ADD CONSTRAINT "_instructions_v_blocks_resources_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_instructions_v_blocks_resources_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_instructions_v_blocks_resources" ADD CONSTRAINT "_instructions_v_blocks_resources_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_instructions_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_instructions_v_blocks_resources_locales" ADD CONSTRAINT "_instructions_v_blocks_resources_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_instructions_v_blocks_resources"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_instructions_v_blocks_instruction" ADD CONSTRAINT "_instructions_v_blocks_instruction_image_media_id_media_id_fk" FOREIGN KEY ("image_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_instructions_v_blocks_instruction" ADD CONSTRAINT "_instructions_v_blocks_instruction_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_instructions_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_instructions_v_blocks_instruction_locales" ADD CONSTRAINT "_instructions_v_blocks_instruction_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_instructions_v_blocks_instruction"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_instructions_v_blocks_instruction_section" ADD CONSTRAINT "_instructions_v_blocks_instruction_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_instructions_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_instructions_v_blocks_instruction_section_locales" ADD CONSTRAINT "_instructions_v_blocks_instruction_section_locales_parent_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_instructions_v_blocks_instruction_section"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_instructions_v" ADD CONSTRAINT "_instructions_v_parent_id_instructions_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."instructions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_instructions_v" ADD CONSTRAINT "_instructions_v_version_tenant_id_websites_id_fk" FOREIGN KEY ("version_tenant_id") REFERENCES "public"."websites"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_instructions_v" ADD CONSTRAINT "_instructions_v_version_image_media_id_media_id_fk" FOREIGN KEY ("version_image_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_instructions_v" ADD CONSTRAINT "_instructions_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_instructions_v_locales" ADD CONSTRAINT "_instructions_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_instructions_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "instructions_blocks_content_order_idx" ON "instructions_blocks_content" USING btree ("_order");
  CREATE INDEX "instructions_blocks_content_parent_id_idx" ON "instructions_blocks_content" USING btree ("_parent_id");
  CREATE INDEX "instructions_blocks_content_path_idx" ON "instructions_blocks_content" USING btree ("_path");
  CREATE UNIQUE INDEX "instructions_blocks_content_locales_locale_parent_id_unique" ON "instructions_blocks_content_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "instructions_blocks_resources_items_order_idx" ON "instructions_blocks_resources_items" USING btree ("_order");
  CREATE INDEX "instructions_blocks_resources_items_parent_id_idx" ON "instructions_blocks_resources_items" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "instructions_blocks_resources_items_locales_locale_parent_id" ON "instructions_blocks_resources_items_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "instructions_blocks_resources_order_idx" ON "instructions_blocks_resources" USING btree ("_order");
  CREATE INDEX "instructions_blocks_resources_parent_id_idx" ON "instructions_blocks_resources" USING btree ("_parent_id");
  CREATE INDEX "instructions_blocks_resources_path_idx" ON "instructions_blocks_resources" USING btree ("_path");
  CREATE UNIQUE INDEX "instructions_blocks_resources_locales_locale_parent_id_uniqu" ON "instructions_blocks_resources_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "instructions_blocks_instruction_order_idx" ON "instructions_blocks_instruction" USING btree ("_order");
  CREATE INDEX "instructions_blocks_instruction_parent_id_idx" ON "instructions_blocks_instruction" USING btree ("_parent_id");
  CREATE INDEX "instructions_blocks_instruction_path_idx" ON "instructions_blocks_instruction" USING btree ("_path");
  CREATE INDEX "instructions_blocks_instruction_image_image_media_idx" ON "instructions_blocks_instruction" USING btree ("image_media_id");
  CREATE UNIQUE INDEX "instructions_blocks_instruction_locales_locale_parent_id_uni" ON "instructions_blocks_instruction_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "instructions_blocks_instruction_section_order_idx" ON "instructions_blocks_instruction_section" USING btree ("_order");
  CREATE INDEX "instructions_blocks_instruction_section_parent_id_idx" ON "instructions_blocks_instruction_section" USING btree ("_parent_id");
  CREATE INDEX "instructions_blocks_instruction_section_path_idx" ON "instructions_blocks_instruction_section" USING btree ("_path");
  CREATE UNIQUE INDEX "instructions_blocks_instruction_section_locales_locale_paren" ON "instructions_blocks_instruction_section_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "instructions_tenant_idx" ON "instructions" USING btree ("tenant_id");
  CREATE INDEX "instructions_image_image_media_idx" ON "instructions" USING btree ("image_media_id");
  CREATE UNIQUE INDEX "instructions_resource_id_idx" ON "instructions" USING btree ("resource_id");
  CREATE INDEX "instructions_meta_meta_image_idx" ON "instructions" USING btree ("meta_image_id");
  CREATE INDEX "instructions_updated_at_idx" ON "instructions" USING btree ("updated_at");
  CREATE INDEX "instructions_created_at_idx" ON "instructions" USING btree ("created_at");
  CREATE INDEX "instructions__status_idx" ON "instructions" USING btree ("_status");
  CREATE INDEX "instructions_slug_idx" ON "instructions_locales" USING btree ("slug","_locale");
  CREATE UNIQUE INDEX "instructions_locales_locale_parent_id_unique" ON "instructions_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_instructions_v_blocks_content_order_idx" ON "_instructions_v_blocks_content" USING btree ("_order");
  CREATE INDEX "_instructions_v_blocks_content_parent_id_idx" ON "_instructions_v_blocks_content" USING btree ("_parent_id");
  CREATE INDEX "_instructions_v_blocks_content_path_idx" ON "_instructions_v_blocks_content" USING btree ("_path");
  CREATE UNIQUE INDEX "_instructions_v_blocks_content_locales_locale_parent_id_uniq" ON "_instructions_v_blocks_content_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_instructions_v_blocks_resources_items_order_idx" ON "_instructions_v_blocks_resources_items" USING btree ("_order");
  CREATE INDEX "_instructions_v_blocks_resources_items_parent_id_idx" ON "_instructions_v_blocks_resources_items" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_instructions_v_blocks_resources_items_locales_locale_parent" ON "_instructions_v_blocks_resources_items_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_instructions_v_blocks_resources_order_idx" ON "_instructions_v_blocks_resources" USING btree ("_order");
  CREATE INDEX "_instructions_v_blocks_resources_parent_id_idx" ON "_instructions_v_blocks_resources" USING btree ("_parent_id");
  CREATE INDEX "_instructions_v_blocks_resources_path_idx" ON "_instructions_v_blocks_resources" USING btree ("_path");
  CREATE UNIQUE INDEX "_instructions_v_blocks_resources_locales_locale_parent_id_un" ON "_instructions_v_blocks_resources_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_instructions_v_blocks_instruction_order_idx" ON "_instructions_v_blocks_instruction" USING btree ("_order");
  CREATE INDEX "_instructions_v_blocks_instruction_parent_id_idx" ON "_instructions_v_blocks_instruction" USING btree ("_parent_id");
  CREATE INDEX "_instructions_v_blocks_instruction_path_idx" ON "_instructions_v_blocks_instruction" USING btree ("_path");
  CREATE INDEX "_instructions_v_blocks_instruction_image_image_media_idx" ON "_instructions_v_blocks_instruction" USING btree ("image_media_id");
  CREATE UNIQUE INDEX "_instructions_v_blocks_instruction_locales_locale_parent_id_" ON "_instructions_v_blocks_instruction_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_instructions_v_blocks_instruction_section_order_idx" ON "_instructions_v_blocks_instruction_section" USING btree ("_order");
  CREATE INDEX "_instructions_v_blocks_instruction_section_parent_id_idx" ON "_instructions_v_blocks_instruction_section" USING btree ("_parent_id");
  CREATE INDEX "_instructions_v_blocks_instruction_section_path_idx" ON "_instructions_v_blocks_instruction_section" USING btree ("_path");
  CREATE UNIQUE INDEX "_instructions_v_blocks_instruction_section_locales_locale_pa" ON "_instructions_v_blocks_instruction_section_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_instructions_v_parent_idx" ON "_instructions_v" USING btree ("parent_id");
  CREATE INDEX "_instructions_v_version_version_tenant_idx" ON "_instructions_v" USING btree ("version_tenant_id");
  CREATE INDEX "_instructions_v_version_image_version_image_media_idx" ON "_instructions_v" USING btree ("version_image_media_id");
  CREATE INDEX "_instructions_v_version_version_resource_id_idx" ON "_instructions_v" USING btree ("version_resource_id");
  CREATE INDEX "_instructions_v_version_meta_version_meta_image_idx" ON "_instructions_v" USING btree ("version_meta_image_id");
  CREATE INDEX "_instructions_v_version_version_updated_at_idx" ON "_instructions_v" USING btree ("version_updated_at");
  CREATE INDEX "_instructions_v_version_version_created_at_idx" ON "_instructions_v" USING btree ("version_created_at");
  CREATE INDEX "_instructions_v_version_version__status_idx" ON "_instructions_v" USING btree ("version__status");
  CREATE INDEX "_instructions_v_created_at_idx" ON "_instructions_v" USING btree ("created_at");
  CREATE INDEX "_instructions_v_updated_at_idx" ON "_instructions_v" USING btree ("updated_at");
  CREATE INDEX "_instructions_v_snapshot_idx" ON "_instructions_v" USING btree ("snapshot");
  CREATE INDEX "_instructions_v_published_locale_idx" ON "_instructions_v" USING btree ("published_locale");
  CREATE INDEX "_instructions_v_latest_idx" ON "_instructions_v" USING btree ("latest");
  CREATE INDEX "_instructions_v_autosave_idx" ON "_instructions_v" USING btree ("autosave");
  CREATE INDEX "_instructions_v_version_version_slug_idx" ON "_instructions_v_locales" USING btree ("version_slug","_locale");
  CREATE UNIQUE INDEX "_instructions_v_locales_locale_parent_id_unique" ON "_instructions_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "imports_updated_at_idx" ON "imports" USING btree ("updated_at");
  CREATE INDEX "imports_created_at_idx" ON "imports" USING btree ("created_at");
  CREATE UNIQUE INDEX "imports_filename_idx" ON "imports" USING btree ("filename");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_instructions_fk" FOREIGN KEY ("instructions_id") REFERENCES "public"."instructions"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_instructions_id_idx" ON "payload_locked_documents_rels" USING btree ("instructions_id");
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "exports_id";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "instructions_blocks_content" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "instructions_blocks_content_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "instructions_blocks_resources_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "instructions_blocks_resources_items_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "instructions_blocks_resources" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "instructions_blocks_resources_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "instructions_blocks_instruction" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "instructions_blocks_instruction_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "instructions_blocks_instruction_section" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "instructions_blocks_instruction_section_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "instructions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "instructions_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_instructions_v_blocks_content" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_instructions_v_blocks_content_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_instructions_v_blocks_resources_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_instructions_v_blocks_resources_items_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_instructions_v_blocks_resources" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_instructions_v_blocks_resources_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_instructions_v_blocks_instruction" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_instructions_v_blocks_instruction_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_instructions_v_blocks_instruction_section" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_instructions_v_blocks_instruction_section_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_instructions_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_instructions_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "imports" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "instructions_blocks_content" CASCADE;
  DROP TABLE "instructions_blocks_content_locales" CASCADE;
  DROP TABLE "instructions_blocks_resources_items" CASCADE;
  DROP TABLE "instructions_blocks_resources_items_locales" CASCADE;
  DROP TABLE "instructions_blocks_resources" CASCADE;
  DROP TABLE "instructions_blocks_resources_locales" CASCADE;
  DROP TABLE "instructions_blocks_instruction" CASCADE;
  DROP TABLE "instructions_blocks_instruction_locales" CASCADE;
  DROP TABLE "instructions_blocks_instruction_section" CASCADE;
  DROP TABLE "instructions_blocks_instruction_section_locales" CASCADE;
  DROP TABLE "instructions" CASCADE;
  DROP TABLE "instructions_locales" CASCADE;
  DROP TABLE "_instructions_v_blocks_content" CASCADE;
  DROP TABLE "_instructions_v_blocks_content_locales" CASCADE;
  DROP TABLE "_instructions_v_blocks_resources_items" CASCADE;
  DROP TABLE "_instructions_v_blocks_resources_items_locales" CASCADE;
  DROP TABLE "_instructions_v_blocks_resources" CASCADE;
  DROP TABLE "_instructions_v_blocks_resources_locales" CASCADE;
  DROP TABLE "_instructions_v_blocks_instruction" CASCADE;
  DROP TABLE "_instructions_v_blocks_instruction_locales" CASCADE;
  DROP TABLE "_instructions_v_blocks_instruction_section" CASCADE;
  DROP TABLE "_instructions_v_blocks_instruction_section_locales" CASCADE;
  DROP TABLE "_instructions_v" CASCADE;
  DROP TABLE "_instructions_v_locales" CASCADE;
  DROP TABLE "imports" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_instructions_fk";
  
  ALTER TABLE "payload_jobs_log" ALTER COLUMN "task_slug" SET DATA TYPE text;
  DROP TYPE "public"."enum_payload_jobs_log_task_slug";
  CREATE TYPE "public"."enum_payload_jobs_log_task_slug" AS ENUM('inline', 'createCollectionExport');
  ALTER TABLE "payload_jobs_log" ALTER COLUMN "task_slug" SET DATA TYPE "public"."enum_payload_jobs_log_task_slug" USING "task_slug"::"public"."enum_payload_jobs_log_task_slug";
  ALTER TABLE "payload_jobs" ALTER COLUMN "task_slug" SET DATA TYPE text;
  DROP TYPE "public"."enum_payload_jobs_task_slug";
  CREATE TYPE "public"."enum_payload_jobs_task_slug" AS ENUM('inline', 'createCollectionExport');
  ALTER TABLE "payload_jobs" ALTER COLUMN "task_slug" SET DATA TYPE "public"."enum_payload_jobs_task_slug" USING "task_slug"::"public"."enum_payload_jobs_task_slug";
  DROP INDEX "payload_locked_documents_rels_instructions_id_idx";
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "exports_id" uuid;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_exports_fk" FOREIGN KEY ("exports_id") REFERENCES "public"."exports"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_exports_id_idx" ON "payload_locked_documents_rels" USING btree ("exports_id");
  ALTER TABLE "users" DROP COLUMN "enable_a_p_i_key";
  ALTER TABLE "users" DROP COLUMN "api_key";
  ALTER TABLE "users" DROP COLUMN "api_key_index";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "instructions_id";
  DROP TYPE "public"."enum_instructions_blocks_resources_type";
  DROP TYPE "public"."enum_instructions_status";
  DROP TYPE "public"."enum__instructions_v_blocks_resources_type";
  DROP TYPE "public"."enum__instructions_v_version_status";
  DROP TYPE "public"."enum__instructions_v_published_locale";
  DROP TYPE "public"."enum_imports_collection_slug";
  DROP TYPE "public"."enum_imports_import_mode";
  DROP TYPE "public"."enum_imports_status";`)
}
