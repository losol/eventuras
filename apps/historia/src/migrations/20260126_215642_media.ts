import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_instructions_blocks_resources_type" AS ENUM('materials', 'tools');
  CREATE TYPE "public"."enum_instructions_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__instructions_v_blocks_resources_type" AS ENUM('materials', 'tools');
  CREATE TYPE "public"."enum__instructions_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__instructions_v_published_locale" AS ENUM('no', 'en');
  CREATE TYPE "public"."enum_terms_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__terms_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__terms_v_published_locale" AS ENUM('no', 'en');
  CREATE TYPE "public"."enum_timelines_related_events_relationship_type" AS ENUM('caused_by', 'led_to', 'part_of', 'concurrent_with', 'related_to');
  CREATE TYPE "public"."enum_timelines_temporal_date_precision" AS ENUM('exact-time', 'exact', 'month', 'year', 'decade', 'century', 'circa');
  CREATE TYPE "public"."enum_timelines_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__timelines_v_version_related_events_relationship_type" AS ENUM('caused_by', 'led_to', 'part_of', 'concurrent_with', 'related_to');
  CREATE TYPE "public"."enum__timelines_v_version_temporal_date_precision" AS ENUM('exact-time', 'exact', 'month', 'year', 'decade', 'century', 'circa');
  CREATE TYPE "public"."enum__timelines_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__timelines_v_published_locale" AS ENUM('no', 'en');
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
  
  CREATE TABLE "media_collections" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"slug_lock" boolean DEFAULT true,
  	"parent_collection_id" uuid,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "media_collections_locales" (
  	"name" varchar NOT NULL,
  	"description" varchar,
  	"slug" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" uuid NOT NULL
  );
  
  CREATE TABLE "_terms_v_version_definitions" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"variant" varchar,
  	"is_primary" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_terms_v_version_definitions_locales" (
  	"definition" jsonb,
  	"short_definition" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" uuid NOT NULL
  );
  
  CREATE TABLE "_terms_v_version_synonyms" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"synonym" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_terms_v" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"parent_id" uuid,
  	"version_tenant_id" uuid,
  	"version_term" varchar,
  	"version_context" varchar,
  	"version_title" varchar,
  	"version_resource_id" varchar,
  	"version_slug_lock" boolean DEFAULT true,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__terms_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__terms_v_published_locale",
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_terms_v_locales" (
  	"version_slug" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" uuid NOT NULL
  );
  
  CREATE TABLE "_terms_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" uuid NOT NULL,
  	"path" varchar NOT NULL,
  	"sources_id" uuid,
  	"terms_id" uuid,
  	"topics_id" uuid
  );
  
  CREATE TABLE "timelines_blocks_content" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "timelines_blocks_content_locales" (
  	"rich_text" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "timelines_blocks_image" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" uuid,
  	"block_name" varchar
  );
  
  CREATE TABLE "timelines_blocks_image_locales" (
  	"caption" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "timelines_related_events" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"event_id" uuid,
  	"relationship_type" "enum_timelines_related_events_relationship_type"
  );
  
  CREATE TABLE "timelines" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"tenant_id" uuid,
  	"image_media_id" uuid,
  	"temporal_start_date" timestamp(3) with time zone,
  	"temporal_end_date" timestamp(3) with time zone,
  	"temporal_date_precision" "enum_timelines_temporal_date_precision" DEFAULT 'exact',
  	"temporal_is_ongoing" boolean DEFAULT false,
  	"slug_lock" boolean DEFAULT true,
  	"resource_id" varchar,
  	"meta_image_id" uuid,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_timelines_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "timelines_locales" (
  	"title" varchar,
  	"summary" varchar,
  	"image_caption" jsonb,
  	"temporal_display_date" varchar,
  	"slug" varchar,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" uuid NOT NULL
  );
  
  CREATE TABLE "timelines_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" uuid NOT NULL,
  	"path" varchar NOT NULL,
  	"topics_id" uuid
  );
  
  CREATE TABLE "_timelines_v_blocks_content" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"_path" text NOT NULL,
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_timelines_v_blocks_content_locales" (
  	"rich_text" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" uuid NOT NULL
  );
  
  CREATE TABLE "_timelines_v_blocks_image" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"_path" text NOT NULL,
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"media_id" uuid,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_timelines_v_blocks_image_locales" (
  	"caption" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" uuid NOT NULL
  );
  
  CREATE TABLE "_timelines_v_version_related_events" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"event_id" uuid,
  	"relationship_type" "enum__timelines_v_version_related_events_relationship_type",
  	"_uuid" varchar
  );
  
  CREATE TABLE "_timelines_v" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"parent_id" uuid,
  	"version_tenant_id" uuid,
  	"version_image_media_id" uuid,
  	"version_temporal_start_date" timestamp(3) with time zone,
  	"version_temporal_end_date" timestamp(3) with time zone,
  	"version_temporal_date_precision" "enum__timelines_v_version_temporal_date_precision" DEFAULT 'exact',
  	"version_temporal_is_ongoing" boolean DEFAULT false,
  	"version_slug_lock" boolean DEFAULT true,
  	"version_resource_id" varchar,
  	"version_meta_image_id" uuid,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__timelines_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__timelines_v_published_locale",
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_timelines_v_locales" (
  	"version_title" varchar,
  	"version_summary" varchar,
  	"version_image_caption" jsonb,
  	"version_temporal_display_date" varchar,
  	"version_slug" varchar,
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" uuid NOT NULL
  );
  
  CREATE TABLE "_timelines_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" uuid NOT NULL,
  	"path" varchar NOT NULL,
  	"topics_id" uuid
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
  ALTER TABLE "terms_definitions_locales" ALTER COLUMN "definition" DROP NOT NULL;
  ALTER TABLE "terms_definitions_locales" ALTER COLUMN "short_definition" DROP NOT NULL;
  ALTER TABLE "terms_synonyms" ALTER COLUMN "synonym" DROP NOT NULL;
  ALTER TABLE "terms" ALTER COLUMN "term" DROP NOT NULL;
  ALTER TABLE "terms" ALTER COLUMN "resource_id" DROP NOT NULL;
  ALTER TABLE "media_rels" ADD COLUMN "media_collections_id" uuid;
  ALTER TABLE "notes" ADD COLUMN "published_at" timestamp(3) with time zone;
  ALTER TABLE "terms" ADD COLUMN "_status" "enum_terms_status" DEFAULT 'draft';
  ALTER TABLE "users" ADD COLUMN "enable_a_p_i_key" boolean;
  ALTER TABLE "users" ADD COLUMN "api_key" varchar;
  ALTER TABLE "users" ADD COLUMN "api_key_index" varchar;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "instructions_id" uuid;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "media_collections_id" uuid;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "timelines_id" uuid;
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
  ALTER TABLE "media_collections" ADD CONSTRAINT "media_collections_parent_collection_id_media_collections_id_fk" FOREIGN KEY ("parent_collection_id") REFERENCES "public"."media_collections"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "media_collections_locales" ADD CONSTRAINT "media_collections_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."media_collections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_terms_v_version_definitions" ADD CONSTRAINT "_terms_v_version_definitions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_terms_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_terms_v_version_definitions_locales" ADD CONSTRAINT "_terms_v_version_definitions_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_terms_v_version_definitions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_terms_v_version_synonyms" ADD CONSTRAINT "_terms_v_version_synonyms_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_terms_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_terms_v" ADD CONSTRAINT "_terms_v_parent_id_terms_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."terms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_terms_v" ADD CONSTRAINT "_terms_v_version_tenant_id_websites_id_fk" FOREIGN KEY ("version_tenant_id") REFERENCES "public"."websites"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_terms_v_locales" ADD CONSTRAINT "_terms_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_terms_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_terms_v_rels" ADD CONSTRAINT "_terms_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_terms_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_terms_v_rels" ADD CONSTRAINT "_terms_v_rels_sources_fk" FOREIGN KEY ("sources_id") REFERENCES "public"."sources"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_terms_v_rels" ADD CONSTRAINT "_terms_v_rels_terms_fk" FOREIGN KEY ("terms_id") REFERENCES "public"."terms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_terms_v_rels" ADD CONSTRAINT "_terms_v_rels_topics_fk" FOREIGN KEY ("topics_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "timelines_blocks_content" ADD CONSTRAINT "timelines_blocks_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."timelines"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "timelines_blocks_content_locales" ADD CONSTRAINT "timelines_blocks_content_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."timelines_blocks_content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "timelines_blocks_image" ADD CONSTRAINT "timelines_blocks_image_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "timelines_blocks_image" ADD CONSTRAINT "timelines_blocks_image_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."timelines"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "timelines_blocks_image_locales" ADD CONSTRAINT "timelines_blocks_image_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."timelines_blocks_image"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "timelines_related_events" ADD CONSTRAINT "timelines_related_events_event_id_timelines_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."timelines"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "timelines_related_events" ADD CONSTRAINT "timelines_related_events_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."timelines"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "timelines" ADD CONSTRAINT "timelines_tenant_id_websites_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."websites"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "timelines" ADD CONSTRAINT "timelines_image_media_id_media_id_fk" FOREIGN KEY ("image_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "timelines" ADD CONSTRAINT "timelines_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "timelines_locales" ADD CONSTRAINT "timelines_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."timelines"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "timelines_rels" ADD CONSTRAINT "timelines_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."timelines"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "timelines_rels" ADD CONSTRAINT "timelines_rels_topics_fk" FOREIGN KEY ("topics_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_timelines_v_blocks_content" ADD CONSTRAINT "_timelines_v_blocks_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_timelines_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_timelines_v_blocks_content_locales" ADD CONSTRAINT "_timelines_v_blocks_content_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_timelines_v_blocks_content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_timelines_v_blocks_image" ADD CONSTRAINT "_timelines_v_blocks_image_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_timelines_v_blocks_image" ADD CONSTRAINT "_timelines_v_blocks_image_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_timelines_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_timelines_v_blocks_image_locales" ADD CONSTRAINT "_timelines_v_blocks_image_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_timelines_v_blocks_image"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_timelines_v_version_related_events" ADD CONSTRAINT "_timelines_v_version_related_events_event_id_timelines_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."timelines"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_timelines_v_version_related_events" ADD CONSTRAINT "_timelines_v_version_related_events_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_timelines_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_timelines_v" ADD CONSTRAINT "_timelines_v_parent_id_timelines_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."timelines"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_timelines_v" ADD CONSTRAINT "_timelines_v_version_tenant_id_websites_id_fk" FOREIGN KEY ("version_tenant_id") REFERENCES "public"."websites"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_timelines_v" ADD CONSTRAINT "_timelines_v_version_image_media_id_media_id_fk" FOREIGN KEY ("version_image_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_timelines_v" ADD CONSTRAINT "_timelines_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_timelines_v_locales" ADD CONSTRAINT "_timelines_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_timelines_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_timelines_v_rels" ADD CONSTRAINT "_timelines_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_timelines_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_timelines_v_rels" ADD CONSTRAINT "_timelines_v_rels_topics_fk" FOREIGN KEY ("topics_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;
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
  CREATE INDEX "media_collections_parent_collection_idx" ON "media_collections" USING btree ("parent_collection_id");
  CREATE INDEX "media_collections_updated_at_idx" ON "media_collections" USING btree ("updated_at");
  CREATE INDEX "media_collections_created_at_idx" ON "media_collections" USING btree ("created_at");
  CREATE INDEX "media_collections_slug_idx" ON "media_collections_locales" USING btree ("slug","_locale");
  CREATE UNIQUE INDEX "media_collections_locales_locale_parent_id_unique" ON "media_collections_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_terms_v_version_definitions_order_idx" ON "_terms_v_version_definitions" USING btree ("_order");
  CREATE INDEX "_terms_v_version_definitions_parent_id_idx" ON "_terms_v_version_definitions" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_terms_v_version_definitions_locales_locale_parent_id_unique" ON "_terms_v_version_definitions_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_terms_v_version_synonyms_order_idx" ON "_terms_v_version_synonyms" USING btree ("_order");
  CREATE INDEX "_terms_v_version_synonyms_parent_id_idx" ON "_terms_v_version_synonyms" USING btree ("_parent_id");
  CREATE INDEX "_terms_v_parent_idx" ON "_terms_v" USING btree ("parent_id");
  CREATE INDEX "_terms_v_version_version_tenant_idx" ON "_terms_v" USING btree ("version_tenant_id");
  CREATE INDEX "_terms_v_version_version_resource_id_idx" ON "_terms_v" USING btree ("version_resource_id");
  CREATE INDEX "_terms_v_version_version_updated_at_idx" ON "_terms_v" USING btree ("version_updated_at");
  CREATE INDEX "_terms_v_version_version_created_at_idx" ON "_terms_v" USING btree ("version_created_at");
  CREATE INDEX "_terms_v_version_version__status_idx" ON "_terms_v" USING btree ("version__status");
  CREATE INDEX "_terms_v_created_at_idx" ON "_terms_v" USING btree ("created_at");
  CREATE INDEX "_terms_v_updated_at_idx" ON "_terms_v" USING btree ("updated_at");
  CREATE INDEX "_terms_v_snapshot_idx" ON "_terms_v" USING btree ("snapshot");
  CREATE INDEX "_terms_v_published_locale_idx" ON "_terms_v" USING btree ("published_locale");
  CREATE INDEX "_terms_v_latest_idx" ON "_terms_v" USING btree ("latest");
  CREATE INDEX "_terms_v_autosave_idx" ON "_terms_v" USING btree ("autosave");
  CREATE INDEX "_terms_v_version_version_slug_idx" ON "_terms_v_locales" USING btree ("version_slug","_locale");
  CREATE UNIQUE INDEX "_terms_v_locales_locale_parent_id_unique" ON "_terms_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_terms_v_rels_order_idx" ON "_terms_v_rels" USING btree ("order");
  CREATE INDEX "_terms_v_rels_parent_idx" ON "_terms_v_rels" USING btree ("parent_id");
  CREATE INDEX "_terms_v_rels_path_idx" ON "_terms_v_rels" USING btree ("path");
  CREATE INDEX "_terms_v_rels_sources_id_idx" ON "_terms_v_rels" USING btree ("sources_id");
  CREATE INDEX "_terms_v_rels_terms_id_idx" ON "_terms_v_rels" USING btree ("terms_id");
  CREATE INDEX "_terms_v_rels_topics_id_idx" ON "_terms_v_rels" USING btree ("topics_id");
  CREATE INDEX "timelines_blocks_content_order_idx" ON "timelines_blocks_content" USING btree ("_order");
  CREATE INDEX "timelines_blocks_content_parent_id_idx" ON "timelines_blocks_content" USING btree ("_parent_id");
  CREATE INDEX "timelines_blocks_content_path_idx" ON "timelines_blocks_content" USING btree ("_path");
  CREATE UNIQUE INDEX "timelines_blocks_content_locales_locale_parent_id_unique" ON "timelines_blocks_content_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "timelines_blocks_image_order_idx" ON "timelines_blocks_image" USING btree ("_order");
  CREATE INDEX "timelines_blocks_image_parent_id_idx" ON "timelines_blocks_image" USING btree ("_parent_id");
  CREATE INDEX "timelines_blocks_image_path_idx" ON "timelines_blocks_image" USING btree ("_path");
  CREATE INDEX "timelines_blocks_image_media_idx" ON "timelines_blocks_image" USING btree ("media_id");
  CREATE UNIQUE INDEX "timelines_blocks_image_locales_locale_parent_id_unique" ON "timelines_blocks_image_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "timelines_related_events_order_idx" ON "timelines_related_events" USING btree ("_order");
  CREATE INDEX "timelines_related_events_parent_id_idx" ON "timelines_related_events" USING btree ("_parent_id");
  CREATE INDEX "timelines_related_events_event_idx" ON "timelines_related_events" USING btree ("event_id");
  CREATE INDEX "timelines_tenant_idx" ON "timelines" USING btree ("tenant_id");
  CREATE INDEX "timelines_image_image_media_idx" ON "timelines" USING btree ("image_media_id");
  CREATE UNIQUE INDEX "timelines_resource_id_idx" ON "timelines" USING btree ("resource_id");
  CREATE INDEX "timelines_meta_meta_image_idx" ON "timelines" USING btree ("meta_image_id");
  CREATE INDEX "timelines_updated_at_idx" ON "timelines" USING btree ("updated_at");
  CREATE INDEX "timelines_created_at_idx" ON "timelines" USING btree ("created_at");
  CREATE INDEX "timelines__status_idx" ON "timelines" USING btree ("_status");
  CREATE INDEX "timelines_slug_idx" ON "timelines_locales" USING btree ("slug","_locale");
  CREATE UNIQUE INDEX "timelines_locales_locale_parent_id_unique" ON "timelines_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "timelines_rels_order_idx" ON "timelines_rels" USING btree ("order");
  CREATE INDEX "timelines_rels_parent_idx" ON "timelines_rels" USING btree ("parent_id");
  CREATE INDEX "timelines_rels_path_idx" ON "timelines_rels" USING btree ("path");
  CREATE INDEX "timelines_rels_topics_id_idx" ON "timelines_rels" USING btree ("topics_id");
  CREATE INDEX "_timelines_v_blocks_content_order_idx" ON "_timelines_v_blocks_content" USING btree ("_order");
  CREATE INDEX "_timelines_v_blocks_content_parent_id_idx" ON "_timelines_v_blocks_content" USING btree ("_parent_id");
  CREATE INDEX "_timelines_v_blocks_content_path_idx" ON "_timelines_v_blocks_content" USING btree ("_path");
  CREATE UNIQUE INDEX "_timelines_v_blocks_content_locales_locale_parent_id_unique" ON "_timelines_v_blocks_content_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_timelines_v_blocks_image_order_idx" ON "_timelines_v_blocks_image" USING btree ("_order");
  CREATE INDEX "_timelines_v_blocks_image_parent_id_idx" ON "_timelines_v_blocks_image" USING btree ("_parent_id");
  CREATE INDEX "_timelines_v_blocks_image_path_idx" ON "_timelines_v_blocks_image" USING btree ("_path");
  CREATE INDEX "_timelines_v_blocks_image_media_idx" ON "_timelines_v_blocks_image" USING btree ("media_id");
  CREATE UNIQUE INDEX "_timelines_v_blocks_image_locales_locale_parent_id_unique" ON "_timelines_v_blocks_image_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_timelines_v_version_related_events_order_idx" ON "_timelines_v_version_related_events" USING btree ("_order");
  CREATE INDEX "_timelines_v_version_related_events_parent_id_idx" ON "_timelines_v_version_related_events" USING btree ("_parent_id");
  CREATE INDEX "_timelines_v_version_related_events_event_idx" ON "_timelines_v_version_related_events" USING btree ("event_id");
  CREATE INDEX "_timelines_v_parent_idx" ON "_timelines_v" USING btree ("parent_id");
  CREATE INDEX "_timelines_v_version_version_tenant_idx" ON "_timelines_v" USING btree ("version_tenant_id");
  CREATE INDEX "_timelines_v_version_image_version_image_media_idx" ON "_timelines_v" USING btree ("version_image_media_id");
  CREATE INDEX "_timelines_v_version_version_resource_id_idx" ON "_timelines_v" USING btree ("version_resource_id");
  CREATE INDEX "_timelines_v_version_meta_version_meta_image_idx" ON "_timelines_v" USING btree ("version_meta_image_id");
  CREATE INDEX "_timelines_v_version_version_updated_at_idx" ON "_timelines_v" USING btree ("version_updated_at");
  CREATE INDEX "_timelines_v_version_version_created_at_idx" ON "_timelines_v" USING btree ("version_created_at");
  CREATE INDEX "_timelines_v_version_version__status_idx" ON "_timelines_v" USING btree ("version__status");
  CREATE INDEX "_timelines_v_created_at_idx" ON "_timelines_v" USING btree ("created_at");
  CREATE INDEX "_timelines_v_updated_at_idx" ON "_timelines_v" USING btree ("updated_at");
  CREATE INDEX "_timelines_v_snapshot_idx" ON "_timelines_v" USING btree ("snapshot");
  CREATE INDEX "_timelines_v_published_locale_idx" ON "_timelines_v" USING btree ("published_locale");
  CREATE INDEX "_timelines_v_latest_idx" ON "_timelines_v" USING btree ("latest");
  CREATE INDEX "_timelines_v_autosave_idx" ON "_timelines_v" USING btree ("autosave");
  CREATE INDEX "_timelines_v_version_version_slug_idx" ON "_timelines_v_locales" USING btree ("version_slug","_locale");
  CREATE UNIQUE INDEX "_timelines_v_locales_locale_parent_id_unique" ON "_timelines_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_timelines_v_rels_order_idx" ON "_timelines_v_rels" USING btree ("order");
  CREATE INDEX "_timelines_v_rels_parent_idx" ON "_timelines_v_rels" USING btree ("parent_id");
  CREATE INDEX "_timelines_v_rels_path_idx" ON "_timelines_v_rels" USING btree ("path");
  CREATE INDEX "_timelines_v_rels_topics_id_idx" ON "_timelines_v_rels" USING btree ("topics_id");
  CREATE INDEX "imports_updated_at_idx" ON "imports" USING btree ("updated_at");
  CREATE INDEX "imports_created_at_idx" ON "imports" USING btree ("created_at");
  CREATE UNIQUE INDEX "imports_filename_idx" ON "imports" USING btree ("filename");
  ALTER TABLE "media_rels" ADD CONSTRAINT "media_rels_media_collections_fk" FOREIGN KEY ("media_collections_id") REFERENCES "public"."media_collections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_instructions_fk" FOREIGN KEY ("instructions_id") REFERENCES "public"."instructions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_collections_fk" FOREIGN KEY ("media_collections_id") REFERENCES "public"."media_collections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_timelines_fk" FOREIGN KEY ("timelines_id") REFERENCES "public"."timelines"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "media_rels_media_collections_id_idx" ON "media_rels" USING btree ("media_collections_id");
  CREATE INDEX "terms__status_idx" ON "terms" USING btree ("_status");
  CREATE INDEX "payload_locked_documents_rels_instructions_id_idx" ON "payload_locked_documents_rels" USING btree ("instructions_id");
  CREATE INDEX "payload_locked_documents_rels_media_collections_id_idx" ON "payload_locked_documents_rels" USING btree ("media_collections_id");
  CREATE INDEX "payload_locked_documents_rels_timelines_id_idx" ON "payload_locked_documents_rels" USING btree ("timelines_id");
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
  ALTER TABLE "media_collections" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "media_collections_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_terms_v_version_definitions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_terms_v_version_definitions_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_terms_v_version_synonyms" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_terms_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_terms_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_terms_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "timelines_blocks_content" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "timelines_blocks_content_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "timelines_blocks_image" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "timelines_blocks_image_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "timelines_related_events" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "timelines" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "timelines_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "timelines_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_timelines_v_blocks_content" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_timelines_v_blocks_content_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_timelines_v_blocks_image" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_timelines_v_blocks_image_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_timelines_v_version_related_events" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_timelines_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_timelines_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_timelines_v_rels" DISABLE ROW LEVEL SECURITY;
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
  DROP TABLE "media_collections" CASCADE;
  DROP TABLE "media_collections_locales" CASCADE;
  DROP TABLE "_terms_v_version_definitions" CASCADE;
  DROP TABLE "_terms_v_version_definitions_locales" CASCADE;
  DROP TABLE "_terms_v_version_synonyms" CASCADE;
  DROP TABLE "_terms_v" CASCADE;
  DROP TABLE "_terms_v_locales" CASCADE;
  DROP TABLE "_terms_v_rels" CASCADE;
  DROP TABLE "timelines_blocks_content" CASCADE;
  DROP TABLE "timelines_blocks_content_locales" CASCADE;
  DROP TABLE "timelines_blocks_image" CASCADE;
  DROP TABLE "timelines_blocks_image_locales" CASCADE;
  DROP TABLE "timelines_related_events" CASCADE;
  DROP TABLE "timelines" CASCADE;
  DROP TABLE "timelines_locales" CASCADE;
  DROP TABLE "timelines_rels" CASCADE;
  DROP TABLE "_timelines_v_blocks_content" CASCADE;
  DROP TABLE "_timelines_v_blocks_content_locales" CASCADE;
  DROP TABLE "_timelines_v_blocks_image" CASCADE;
  DROP TABLE "_timelines_v_blocks_image_locales" CASCADE;
  DROP TABLE "_timelines_v_version_related_events" CASCADE;
  DROP TABLE "_timelines_v" CASCADE;
  DROP TABLE "_timelines_v_locales" CASCADE;
  DROP TABLE "_timelines_v_rels" CASCADE;
  DROP TABLE "imports" CASCADE;
  ALTER TABLE "media_rels" DROP CONSTRAINT "media_rels_media_collections_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_instructions_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_media_collections_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_timelines_fk";
  
  ALTER TABLE "payload_jobs_log" ALTER COLUMN "task_slug" SET DATA TYPE text;
  DROP TYPE "public"."enum_payload_jobs_log_task_slug";
  CREATE TYPE "public"."enum_payload_jobs_log_task_slug" AS ENUM('inline', 'createCollectionExport');
  ALTER TABLE "payload_jobs_log" ALTER COLUMN "task_slug" SET DATA TYPE "public"."enum_payload_jobs_log_task_slug" USING "task_slug"::"public"."enum_payload_jobs_log_task_slug";
  ALTER TABLE "payload_jobs" ALTER COLUMN "task_slug" SET DATA TYPE text;
  DROP TYPE "public"."enum_payload_jobs_task_slug";
  CREATE TYPE "public"."enum_payload_jobs_task_slug" AS ENUM('inline', 'createCollectionExport');
  ALTER TABLE "payload_jobs" ALTER COLUMN "task_slug" SET DATA TYPE "public"."enum_payload_jobs_task_slug" USING "task_slug"::"public"."enum_payload_jobs_task_slug";
  DROP INDEX "media_rels_media_collections_id_idx";
  DROP INDEX "terms__status_idx";
  DROP INDEX "payload_locked_documents_rels_instructions_id_idx";
  DROP INDEX "payload_locked_documents_rels_media_collections_id_idx";
  DROP INDEX "payload_locked_documents_rels_timelines_id_idx";
  ALTER TABLE "terms_definitions_locales" ALTER COLUMN "definition" SET NOT NULL;
  ALTER TABLE "terms_definitions_locales" ALTER COLUMN "short_definition" SET NOT NULL;
  ALTER TABLE "terms_synonyms" ALTER COLUMN "synonym" SET NOT NULL;
  ALTER TABLE "terms" ALTER COLUMN "term" SET NOT NULL;
  ALTER TABLE "terms" ALTER COLUMN "resource_id" SET NOT NULL;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "exports_id" uuid;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_exports_fk" FOREIGN KEY ("exports_id") REFERENCES "public"."exports"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_exports_id_idx" ON "payload_locked_documents_rels" USING btree ("exports_id");
  ALTER TABLE "media_rels" DROP COLUMN "media_collections_id";
  ALTER TABLE "notes" DROP COLUMN "published_at";
  ALTER TABLE "terms" DROP COLUMN "_status";
  ALTER TABLE "users" DROP COLUMN "enable_a_p_i_key";
  ALTER TABLE "users" DROP COLUMN "api_key";
  ALTER TABLE "users" DROP COLUMN "api_key_index";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "instructions_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "media_collections_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "timelines_id";
  DROP TYPE "public"."enum_instructions_blocks_resources_type";
  DROP TYPE "public"."enum_instructions_status";
  DROP TYPE "public"."enum__instructions_v_blocks_resources_type";
  DROP TYPE "public"."enum__instructions_v_version_status";
  DROP TYPE "public"."enum__instructions_v_published_locale";
  DROP TYPE "public"."enum_terms_status";
  DROP TYPE "public"."enum__terms_v_version_status";
  DROP TYPE "public"."enum__terms_v_published_locale";
  DROP TYPE "public"."enum_timelines_related_events_relationship_type";
  DROP TYPE "public"."enum_timelines_temporal_date_precision";
  DROP TYPE "public"."enum_timelines_status";
  DROP TYPE "public"."enum__timelines_v_version_related_events_relationship_type";
  DROP TYPE "public"."enum__timelines_v_version_temporal_date_precision";
  DROP TYPE "public"."enum__timelines_v_version_status";
  DROP TYPE "public"."enum__timelines_v_published_locale";
  DROP TYPE "public"."enum_imports_collection_slug";
  DROP TYPE "public"."enum_imports_import_mode";
  DROP TYPE "public"."enum_imports_status";`)
}
