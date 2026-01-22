import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_projects_status" RENAME TO "enum_cases_status";
  ALTER TYPE "public"."enum__projects_v_version_status" RENAME TO "enum__cases_v_version_status";
  ALTER TYPE "public"."enum__projects_v_published_locale" RENAME TO "enum__cases_v_published_locale";
  ALTER TABLE "projects_blocks_content" RENAME TO "cases_blocks_content";
  ALTER TABLE "projects_blocks_content_locales" RENAME TO "cases_blocks_content_locales";
  ALTER TABLE "projects_partners" RENAME TO "cases_partners";
  ALTER TABLE "projects_partners_locales" RENAME TO "cases_partners_locales";
  ALTER TABLE "projects" RENAME TO "cases";
  ALTER TABLE "projects_locales" RENAME TO "cases_locales";
  ALTER TABLE "projects_rels" RENAME TO "cases_rels";
  ALTER TABLE "_projects_v_blocks_content" RENAME TO "_cases_v_blocks_content";
  ALTER TABLE "_projects_v_blocks_content_locales" RENAME TO "_cases_v_blocks_content_locales";
  ALTER TABLE "_projects_v_version_partners" RENAME TO "_cases_v_version_partners";
  ALTER TABLE "_projects_v_version_partners_locales" RENAME TO "_cases_v_version_partners_locales";
  ALTER TABLE "_projects_v" RENAME TO "_cases_v";
  ALTER TABLE "_projects_v_locales" RENAME TO "_cases_v_locales";
  ALTER TABLE "_projects_v_rels" RENAME TO "_cases_v_rels";
  ALTER TABLE "articles_rels" RENAME COLUMN "projects_id" TO "cases_id";
  ALTER TABLE "_articles_v_rels" RENAME COLUMN "projects_id" TO "cases_id";
  ALTER TABLE "media_rels" RENAME COLUMN "projects_id" TO "cases_id";
  ALTER TABLE "notes_rels" RENAME COLUMN "projects_id" TO "cases_id";
  ALTER TABLE "payload_locked_documents_rels" RENAME COLUMN "projects_id" TO "cases_id";
  ALTER TABLE "articles_rels" DROP CONSTRAINT "articles_rels_projects_fk";
  
  ALTER TABLE "_articles_v_rels" DROP CONSTRAINT "_articles_v_rels_projects_fk";
  
  ALTER TABLE "media_rels" DROP CONSTRAINT "media_rels_projects_fk";
  
  ALTER TABLE "notes_rels" DROP CONSTRAINT "notes_rels_projects_fk";
  
  ALTER TABLE "cases_blocks_content" DROP CONSTRAINT "projects_blocks_content_parent_id_fk";
  
  ALTER TABLE "cases_blocks_content_locales" DROP CONSTRAINT "projects_blocks_content_locales_parent_id_fk";
  
  ALTER TABLE "cases_partners" DROP CONSTRAINT "projects_partners_parent_id_fk";
  
  ALTER TABLE "cases_partners_locales" DROP CONSTRAINT "projects_partners_locales_parent_id_fk";
  
  ALTER TABLE "cases" DROP CONSTRAINT "projects_tenant_id_websites_id_fk";
  
  ALTER TABLE "cases" DROP CONSTRAINT "projects_image_media_id_media_id_fk";
  
  ALTER TABLE "cases" DROP CONSTRAINT "projects_meta_image_id_media_id_fk";
  
  ALTER TABLE "cases_locales" DROP CONSTRAINT "projects_locales_parent_id_fk";
  
  ALTER TABLE "cases_rels" DROP CONSTRAINT "projects_rels_parent_fk";
  
  ALTER TABLE "cases_rels" DROP CONSTRAINT "projects_rels_persons_fk";
  
  ALTER TABLE "cases_rels" DROP CONSTRAINT "projects_rels_organizations_fk";
  
  ALTER TABLE "_cases_v_blocks_content" DROP CONSTRAINT "_projects_v_blocks_content_parent_id_fk";
  
  ALTER TABLE "_cases_v_blocks_content_locales" DROP CONSTRAINT "_projects_v_blocks_content_locales_parent_id_fk";
  
  ALTER TABLE "_cases_v_version_partners" DROP CONSTRAINT "_projects_v_version_partners_parent_id_fk";
  
  ALTER TABLE "_cases_v_version_partners_locales" DROP CONSTRAINT "_projects_v_version_partners_locales_parent_id_fk";
  
  ALTER TABLE "_cases_v" DROP CONSTRAINT "_projects_v_parent_id_projects_id_fk";
  
  ALTER TABLE "_cases_v" DROP CONSTRAINT "_projects_v_version_tenant_id_websites_id_fk";
  
  ALTER TABLE "_cases_v" DROP CONSTRAINT "_projects_v_version_image_media_id_media_id_fk";
  
  ALTER TABLE "_cases_v" DROP CONSTRAINT "_projects_v_version_meta_image_id_media_id_fk";
  
  ALTER TABLE "_cases_v_locales" DROP CONSTRAINT "_projects_v_locales_parent_id_fk";
  
  ALTER TABLE "_cases_v_rels" DROP CONSTRAINT "_projects_v_rels_parent_fk";
  
  ALTER TABLE "_cases_v_rels" DROP CONSTRAINT "_projects_v_rels_persons_fk";
  
  ALTER TABLE "_cases_v_rels" DROP CONSTRAINT "_projects_v_rels_organizations_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_projects_fk";
  
  ALTER TABLE "pages_blocks_archive" ALTER COLUMN "relation_to" SET DATA TYPE text;
  ALTER TABLE "pages_blocks_archive" ALTER COLUMN "relation_to" SET DEFAULT 'articles'::text;
  DROP TYPE "public"."enum_pages_blocks_archive_relation_to";
  CREATE TYPE "public"."enum_pages_blocks_archive_relation_to" AS ENUM('articles', 'happenings', 'notes', 'cases');
  ALTER TABLE "pages_blocks_archive" ALTER COLUMN "relation_to" SET DEFAULT 'articles'::"public"."enum_pages_blocks_archive_relation_to";
  ALTER TABLE "pages_blocks_archive" ALTER COLUMN "relation_to" SET DATA TYPE "public"."enum_pages_blocks_archive_relation_to" USING "relation_to"::"public"."enum_pages_blocks_archive_relation_to";
  ALTER TABLE "_pages_v_blocks_archive" ALTER COLUMN "relation_to" SET DATA TYPE text;
  ALTER TABLE "_pages_v_blocks_archive" ALTER COLUMN "relation_to" SET DEFAULT 'articles'::text;
  DROP TYPE "public"."enum__pages_v_blocks_archive_relation_to";
  CREATE TYPE "public"."enum__pages_v_blocks_archive_relation_to" AS ENUM('articles', 'happenings', 'notes', 'cases');
  ALTER TABLE "_pages_v_blocks_archive" ALTER COLUMN "relation_to" SET DEFAULT 'articles'::"public"."enum__pages_v_blocks_archive_relation_to";
  ALTER TABLE "_pages_v_blocks_archive" ALTER COLUMN "relation_to" SET DATA TYPE "public"."enum__pages_v_blocks_archive_relation_to" USING "relation_to"::"public"."enum__pages_v_blocks_archive_relation_to";
  DROP INDEX "articles_rels_projects_id_idx";
  DROP INDEX "_articles_v_rels_projects_id_idx";
  DROP INDEX "media_rels_projects_id_idx";
  DROP INDEX "notes_rels_projects_id_idx";
  DROP INDEX "projects_blocks_content_order_idx";
  DROP INDEX "projects_blocks_content_parent_id_idx";
  DROP INDEX "projects_blocks_content_path_idx";
  DROP INDEX "projects_blocks_content_locales_locale_parent_id_unique";
  DROP INDEX "projects_partners_order_idx";
  DROP INDEX "projects_partners_parent_id_idx";
  DROP INDEX "projects_partners_locales_locale_parent_id_unique";
  DROP INDEX "projects_tenant_idx";
  DROP INDEX "projects_image_image_media_idx";
  DROP INDEX "projects_resource_id_idx";
  DROP INDEX "projects_meta_meta_image_idx";
  DROP INDEX "projects_updated_at_idx";
  DROP INDEX "projects_created_at_idx";
  DROP INDEX "projects__status_idx";
  DROP INDEX "projects_slug_idx";
  DROP INDEX "projects_locales_locale_parent_id_unique";
  DROP INDEX "projects_rels_order_idx";
  DROP INDEX "projects_rels_parent_idx";
  DROP INDEX "projects_rels_path_idx";
  DROP INDEX "projects_rels_persons_id_idx";
  DROP INDEX "projects_rels_organizations_id_idx";
  DROP INDEX "_projects_v_blocks_content_order_idx";
  DROP INDEX "_projects_v_blocks_content_parent_id_idx";
  DROP INDEX "_projects_v_blocks_content_path_idx";
  DROP INDEX "_projects_v_blocks_content_locales_locale_parent_id_unique";
  DROP INDEX "_projects_v_version_partners_order_idx";
  DROP INDEX "_projects_v_version_partners_parent_id_idx";
  DROP INDEX "_projects_v_version_partners_locales_locale_parent_id_unique";
  DROP INDEX "_projects_v_parent_idx";
  DROP INDEX "_projects_v_version_version_tenant_idx";
  DROP INDEX "_projects_v_version_image_version_image_media_idx";
  DROP INDEX "_projects_v_version_version_resource_id_idx";
  DROP INDEX "_projects_v_version_meta_version_meta_image_idx";
  DROP INDEX "_projects_v_version_version_updated_at_idx";
  DROP INDEX "_projects_v_version_version_created_at_idx";
  DROP INDEX "_projects_v_version_version__status_idx";
  DROP INDEX "_projects_v_created_at_idx";
  DROP INDEX "_projects_v_updated_at_idx";
  DROP INDEX "_projects_v_snapshot_idx";
  DROP INDEX "_projects_v_published_locale_idx";
  DROP INDEX "_projects_v_latest_idx";
  DROP INDEX "_projects_v_autosave_idx";
  DROP INDEX "_projects_v_version_version_slug_idx";
  DROP INDEX "_projects_v_locales_locale_parent_id_unique";
  DROP INDEX "_projects_v_rels_order_idx";
  DROP INDEX "_projects_v_rels_parent_idx";
  DROP INDEX "_projects_v_rels_path_idx";
  DROP INDEX "_projects_v_rels_persons_id_idx";
  DROP INDEX "_projects_v_rels_organizations_id_idx";
  DROP INDEX "payload_locked_documents_rels_projects_id_idx";
  ALTER TABLE "articles_rels" ADD CONSTRAINT "articles_rels_cases_fk" FOREIGN KEY ("cases_id") REFERENCES "public"."cases"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_rels" ADD CONSTRAINT "_articles_v_rels_cases_fk" FOREIGN KEY ("cases_id") REFERENCES "public"."cases"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media_rels" ADD CONSTRAINT "media_rels_cases_fk" FOREIGN KEY ("cases_id") REFERENCES "public"."cases"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "notes_rels" ADD CONSTRAINT "notes_rels_cases_fk" FOREIGN KEY ("cases_id") REFERENCES "public"."cases"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cases_blocks_content" ADD CONSTRAINT "cases_blocks_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."cases"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cases_blocks_content_locales" ADD CONSTRAINT "cases_blocks_content_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."cases_blocks_content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cases_partners" ADD CONSTRAINT "cases_partners_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."cases"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cases_partners_locales" ADD CONSTRAINT "cases_partners_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."cases_partners"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cases" ADD CONSTRAINT "cases_tenant_id_websites_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."websites"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cases" ADD CONSTRAINT "cases_image_media_id_media_id_fk" FOREIGN KEY ("image_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cases" ADD CONSTRAINT "cases_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cases_locales" ADD CONSTRAINT "cases_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."cases"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cases_rels" ADD CONSTRAINT "cases_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."cases"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cases_rels" ADD CONSTRAINT "cases_rels_persons_fk" FOREIGN KEY ("persons_id") REFERENCES "public"."persons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cases_rels" ADD CONSTRAINT "cases_rels_organizations_fk" FOREIGN KEY ("organizations_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_cases_v_blocks_content" ADD CONSTRAINT "_cases_v_blocks_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_cases_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_cases_v_blocks_content_locales" ADD CONSTRAINT "_cases_v_blocks_content_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_cases_v_blocks_content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_cases_v_version_partners" ADD CONSTRAINT "_cases_v_version_partners_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_cases_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_cases_v_version_partners_locales" ADD CONSTRAINT "_cases_v_version_partners_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_cases_v_version_partners"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_cases_v" ADD CONSTRAINT "_cases_v_parent_id_cases_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."cases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_cases_v" ADD CONSTRAINT "_cases_v_version_tenant_id_websites_id_fk" FOREIGN KEY ("version_tenant_id") REFERENCES "public"."websites"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_cases_v" ADD CONSTRAINT "_cases_v_version_image_media_id_media_id_fk" FOREIGN KEY ("version_image_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_cases_v" ADD CONSTRAINT "_cases_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_cases_v_locales" ADD CONSTRAINT "_cases_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_cases_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_cases_v_rels" ADD CONSTRAINT "_cases_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_cases_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_cases_v_rels" ADD CONSTRAINT "_cases_v_rels_persons_fk" FOREIGN KEY ("persons_id") REFERENCES "public"."persons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_cases_v_rels" ADD CONSTRAINT "_cases_v_rels_organizations_fk" FOREIGN KEY ("organizations_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_cases_fk" FOREIGN KEY ("cases_id") REFERENCES "public"."cases"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "articles_rels_cases_id_idx" ON "articles_rels" USING btree ("cases_id");
  CREATE INDEX "_articles_v_rels_cases_id_idx" ON "_articles_v_rels" USING btree ("cases_id");
  CREATE INDEX "media_rels_cases_id_idx" ON "media_rels" USING btree ("cases_id");
  CREATE INDEX "notes_rels_cases_id_idx" ON "notes_rels" USING btree ("cases_id");
  CREATE INDEX "cases_blocks_content_order_idx" ON "cases_blocks_content" USING btree ("_order");
  CREATE INDEX "cases_blocks_content_parent_id_idx" ON "cases_blocks_content" USING btree ("_parent_id");
  CREATE INDEX "cases_blocks_content_path_idx" ON "cases_blocks_content" USING btree ("_path");
  CREATE UNIQUE INDEX "cases_blocks_content_locales_locale_parent_id_unique" ON "cases_blocks_content_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "cases_partners_order_idx" ON "cases_partners" USING btree ("_order");
  CREATE INDEX "cases_partners_parent_id_idx" ON "cases_partners" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "cases_partners_locales_locale_parent_id_unique" ON "cases_partners_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "cases_tenant_idx" ON "cases" USING btree ("tenant_id");
  CREATE INDEX "cases_image_image_media_idx" ON "cases" USING btree ("image_media_id");
  CREATE UNIQUE INDEX "cases_resource_id_idx" ON "cases" USING btree ("resource_id");
  CREATE INDEX "cases_meta_meta_image_idx" ON "cases" USING btree ("meta_image_id");
  CREATE INDEX "cases_updated_at_idx" ON "cases" USING btree ("updated_at");
  CREATE INDEX "cases_created_at_idx" ON "cases" USING btree ("created_at");
  CREATE INDEX "cases__status_idx" ON "cases" USING btree ("_status");
  CREATE INDEX "cases_slug_idx" ON "cases_locales" USING btree ("slug","_locale");
  CREATE UNIQUE INDEX "cases_locales_locale_parent_id_unique" ON "cases_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "cases_rels_order_idx" ON "cases_rels" USING btree ("order");
  CREATE INDEX "cases_rels_parent_idx" ON "cases_rels" USING btree ("parent_id");
  CREATE INDEX "cases_rels_path_idx" ON "cases_rels" USING btree ("path");
  CREATE INDEX "cases_rels_persons_id_idx" ON "cases_rels" USING btree ("persons_id");
  CREATE INDEX "cases_rels_organizations_id_idx" ON "cases_rels" USING btree ("organizations_id");
  CREATE INDEX "_cases_v_blocks_content_order_idx" ON "_cases_v_blocks_content" USING btree ("_order");
  CREATE INDEX "_cases_v_blocks_content_parent_id_idx" ON "_cases_v_blocks_content" USING btree ("_parent_id");
  CREATE INDEX "_cases_v_blocks_content_path_idx" ON "_cases_v_blocks_content" USING btree ("_path");
  CREATE UNIQUE INDEX "_cases_v_blocks_content_locales_locale_parent_id_unique" ON "_cases_v_blocks_content_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_cases_v_version_partners_order_idx" ON "_cases_v_version_partners" USING btree ("_order");
  CREATE INDEX "_cases_v_version_partners_parent_id_idx" ON "_cases_v_version_partners" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_cases_v_version_partners_locales_locale_parent_id_unique" ON "_cases_v_version_partners_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_cases_v_parent_idx" ON "_cases_v" USING btree ("parent_id");
  CREATE INDEX "_cases_v_version_version_tenant_idx" ON "_cases_v" USING btree ("version_tenant_id");
  CREATE INDEX "_cases_v_version_image_version_image_media_idx" ON "_cases_v" USING btree ("version_image_media_id");
  CREATE INDEX "_cases_v_version_version_resource_id_idx" ON "_cases_v" USING btree ("version_resource_id");
  CREATE INDEX "_cases_v_version_meta_version_meta_image_idx" ON "_cases_v" USING btree ("version_meta_image_id");
  CREATE INDEX "_cases_v_version_version_updated_at_idx" ON "_cases_v" USING btree ("version_updated_at");
  CREATE INDEX "_cases_v_version_version_created_at_idx" ON "_cases_v" USING btree ("version_created_at");
  CREATE INDEX "_cases_v_version_version__status_idx" ON "_cases_v" USING btree ("version__status");
  CREATE INDEX "_cases_v_created_at_idx" ON "_cases_v" USING btree ("created_at");
  CREATE INDEX "_cases_v_updated_at_idx" ON "_cases_v" USING btree ("updated_at");
  CREATE INDEX "_cases_v_snapshot_idx" ON "_cases_v" USING btree ("snapshot");
  CREATE INDEX "_cases_v_published_locale_idx" ON "_cases_v" USING btree ("published_locale");
  CREATE INDEX "_cases_v_latest_idx" ON "_cases_v" USING btree ("latest");
  CREATE INDEX "_cases_v_autosave_idx" ON "_cases_v" USING btree ("autosave");
  CREATE INDEX "_cases_v_version_version_slug_idx" ON "_cases_v_locales" USING btree ("version_slug","_locale");
  CREATE UNIQUE INDEX "_cases_v_locales_locale_parent_id_unique" ON "_cases_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_cases_v_rels_order_idx" ON "_cases_v_rels" USING btree ("order");
  CREATE INDEX "_cases_v_rels_parent_idx" ON "_cases_v_rels" USING btree ("parent_id");
  CREATE INDEX "_cases_v_rels_path_idx" ON "_cases_v_rels" USING btree ("path");
  CREATE INDEX "_cases_v_rels_persons_id_idx" ON "_cases_v_rels" USING btree ("persons_id");
  CREATE INDEX "_cases_v_rels_organizations_id_idx" ON "_cases_v_rels" USING btree ("organizations_id");
  CREATE INDEX "payload_locked_documents_rels_cases_id_idx" ON "payload_locked_documents_rels" USING btree ("cases_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_cases_status" RENAME TO "enum_projects_status";
  ALTER TYPE "public"."enum__cases_v_version_status" RENAME TO "enum__projects_v_version_status";
  ALTER TYPE "public"."enum__cases_v_published_locale" RENAME TO "enum__projects_v_published_locale";
  ALTER TABLE "cases_blocks_content" RENAME TO "projects_blocks_content";
  ALTER TABLE "cases_blocks_content_locales" RENAME TO "projects_blocks_content_locales";
  ALTER TABLE "cases_partners" RENAME TO "projects_partners";
  ALTER TABLE "cases_partners_locales" RENAME TO "projects_partners_locales";
  ALTER TABLE "cases" RENAME TO "projects";
  ALTER TABLE "cases_locales" RENAME TO "projects_locales";
  ALTER TABLE "cases_rels" RENAME TO "projects_rels";
  ALTER TABLE "_cases_v_blocks_content" RENAME TO "_projects_v_blocks_content";
  ALTER TABLE "_cases_v_blocks_content_locales" RENAME TO "_projects_v_blocks_content_locales";
  ALTER TABLE "_cases_v_version_partners" RENAME TO "_projects_v_version_partners";
  ALTER TABLE "_cases_v_version_partners_locales" RENAME TO "_projects_v_version_partners_locales";
  ALTER TABLE "_cases_v" RENAME TO "_projects_v";
  ALTER TABLE "_cases_v_locales" RENAME TO "_projects_v_locales";
  ALTER TABLE "_cases_v_rels" RENAME TO "_projects_v_rels";
  ALTER TABLE "articles_rels" RENAME COLUMN "cases_id" TO "projects_id";
  ALTER TABLE "_articles_v_rels" RENAME COLUMN "cases_id" TO "projects_id";
  ALTER TABLE "media_rels" RENAME COLUMN "cases_id" TO "projects_id";
  ALTER TABLE "notes_rels" RENAME COLUMN "cases_id" TO "projects_id";
  ALTER TABLE "payload_locked_documents_rels" RENAME COLUMN "cases_id" TO "projects_id";
  ALTER TABLE "articles_rels" DROP CONSTRAINT "articles_rels_cases_fk";
  
  ALTER TABLE "_articles_v_rels" DROP CONSTRAINT "_articles_v_rels_cases_fk";
  
  ALTER TABLE "media_rels" DROP CONSTRAINT "media_rels_cases_fk";
  
  ALTER TABLE "notes_rels" DROP CONSTRAINT "notes_rels_cases_fk";
  
  ALTER TABLE "projects_blocks_content" DROP CONSTRAINT "cases_blocks_content_parent_id_fk";
  
  ALTER TABLE "projects_blocks_content_locales" DROP CONSTRAINT "cases_blocks_content_locales_parent_id_fk";
  
  ALTER TABLE "projects_partners" DROP CONSTRAINT "cases_partners_parent_id_fk";
  
  ALTER TABLE "projects_partners_locales" DROP CONSTRAINT "cases_partners_locales_parent_id_fk";
  
  ALTER TABLE "projects" DROP CONSTRAINT "cases_tenant_id_websites_id_fk";
  
  ALTER TABLE "projects" DROP CONSTRAINT "cases_image_media_id_media_id_fk";
  
  ALTER TABLE "projects" DROP CONSTRAINT "cases_meta_image_id_media_id_fk";
  
  ALTER TABLE "projects_locales" DROP CONSTRAINT "cases_locales_parent_id_fk";
  
  ALTER TABLE "projects_rels" DROP CONSTRAINT "cases_rels_parent_fk";
  
  ALTER TABLE "projects_rels" DROP CONSTRAINT "cases_rels_persons_fk";
  
  ALTER TABLE "projects_rels" DROP CONSTRAINT "cases_rels_organizations_fk";
  
  ALTER TABLE "_projects_v_blocks_content" DROP CONSTRAINT "_cases_v_blocks_content_parent_id_fk";
  
  ALTER TABLE "_projects_v_blocks_content_locales" DROP CONSTRAINT "_cases_v_blocks_content_locales_parent_id_fk";
  
  ALTER TABLE "_projects_v_version_partners" DROP CONSTRAINT "_cases_v_version_partners_parent_id_fk";
  
  ALTER TABLE "_projects_v_version_partners_locales" DROP CONSTRAINT "_cases_v_version_partners_locales_parent_id_fk";
  
  ALTER TABLE "_projects_v" DROP CONSTRAINT "_cases_v_parent_id_cases_id_fk";
  
  ALTER TABLE "_projects_v" DROP CONSTRAINT "_cases_v_version_tenant_id_websites_id_fk";
  
  ALTER TABLE "_projects_v" DROP CONSTRAINT "_cases_v_version_image_media_id_media_id_fk";
  
  ALTER TABLE "_projects_v" DROP CONSTRAINT "_cases_v_version_meta_image_id_media_id_fk";
  
  ALTER TABLE "_projects_v_locales" DROP CONSTRAINT "_cases_v_locales_parent_id_fk";
  
  ALTER TABLE "_projects_v_rels" DROP CONSTRAINT "_cases_v_rels_parent_fk";
  
  ALTER TABLE "_projects_v_rels" DROP CONSTRAINT "_cases_v_rels_persons_fk";
  
  ALTER TABLE "_projects_v_rels" DROP CONSTRAINT "_cases_v_rels_organizations_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_cases_fk";
  
  ALTER TABLE "pages_blocks_archive" ALTER COLUMN "relation_to" SET DATA TYPE text;
  ALTER TABLE "pages_blocks_archive" ALTER COLUMN "relation_to" SET DEFAULT 'articles'::text;
  DROP TYPE "public"."enum_pages_blocks_archive_relation_to";
  CREATE TYPE "public"."enum_pages_blocks_archive_relation_to" AS ENUM('articles', 'happenings', 'notes', 'projects');
  ALTER TABLE "pages_blocks_archive" ALTER COLUMN "relation_to" SET DEFAULT 'articles'::"public"."enum_pages_blocks_archive_relation_to";
  ALTER TABLE "pages_blocks_archive" ALTER COLUMN "relation_to" SET DATA TYPE "public"."enum_pages_blocks_archive_relation_to" USING "relation_to"::"public"."enum_pages_blocks_archive_relation_to";
  ALTER TABLE "_pages_v_blocks_archive" ALTER COLUMN "relation_to" SET DATA TYPE text;
  ALTER TABLE "_pages_v_blocks_archive" ALTER COLUMN "relation_to" SET DEFAULT 'articles'::text;
  DROP TYPE "public"."enum__pages_v_blocks_archive_relation_to";
  CREATE TYPE "public"."enum__pages_v_blocks_archive_relation_to" AS ENUM('articles', 'happenings', 'notes', 'projects');
  ALTER TABLE "_pages_v_blocks_archive" ALTER COLUMN "relation_to" SET DEFAULT 'articles'::"public"."enum__pages_v_blocks_archive_relation_to";
  ALTER TABLE "_pages_v_blocks_archive" ALTER COLUMN "relation_to" SET DATA TYPE "public"."enum__pages_v_blocks_archive_relation_to" USING "relation_to"::"public"."enum__pages_v_blocks_archive_relation_to";
  DROP INDEX "articles_rels_cases_id_idx";
  DROP INDEX "_articles_v_rels_cases_id_idx";
  DROP INDEX "media_rels_cases_id_idx";
  DROP INDEX "notes_rels_cases_id_idx";
  DROP INDEX "cases_blocks_content_order_idx";
  DROP INDEX "cases_blocks_content_parent_id_idx";
  DROP INDEX "cases_blocks_content_path_idx";
  DROP INDEX "cases_blocks_content_locales_locale_parent_id_unique";
  DROP INDEX "cases_partners_order_idx";
  DROP INDEX "cases_partners_parent_id_idx";
  DROP INDEX "cases_partners_locales_locale_parent_id_unique";
  DROP INDEX "cases_tenant_idx";
  DROP INDEX "cases_image_image_media_idx";
  DROP INDEX "cases_resource_id_idx";
  DROP INDEX "cases_meta_meta_image_idx";
  DROP INDEX "cases_updated_at_idx";
  DROP INDEX "cases_created_at_idx";
  DROP INDEX "cases__status_idx";
  DROP INDEX "cases_slug_idx";
  DROP INDEX "cases_locales_locale_parent_id_unique";
  DROP INDEX "cases_rels_order_idx";
  DROP INDEX "cases_rels_parent_idx";
  DROP INDEX "cases_rels_path_idx";
  DROP INDEX "cases_rels_persons_id_idx";
  DROP INDEX "cases_rels_organizations_id_idx";
  DROP INDEX "_cases_v_blocks_content_order_idx";
  DROP INDEX "_cases_v_blocks_content_parent_id_idx";
  DROP INDEX "_cases_v_blocks_content_path_idx";
  DROP INDEX "_cases_v_blocks_content_locales_locale_parent_id_unique";
  DROP INDEX "_cases_v_version_partners_order_idx";
  DROP INDEX "_cases_v_version_partners_parent_id_idx";
  DROP INDEX "_cases_v_version_partners_locales_locale_parent_id_unique";
  DROP INDEX "_cases_v_parent_idx";
  DROP INDEX "_cases_v_version_version_tenant_idx";
  DROP INDEX "_cases_v_version_image_version_image_media_idx";
  DROP INDEX "_cases_v_version_version_resource_id_idx";
  DROP INDEX "_cases_v_version_meta_version_meta_image_idx";
  DROP INDEX "_cases_v_version_version_updated_at_idx";
  DROP INDEX "_cases_v_version_version_created_at_idx";
  DROP INDEX "_cases_v_version_version__status_idx";
  DROP INDEX "_cases_v_created_at_idx";
  DROP INDEX "_cases_v_updated_at_idx";
  DROP INDEX "_cases_v_snapshot_idx";
  DROP INDEX "_cases_v_published_locale_idx";
  DROP INDEX "_cases_v_latest_idx";
  DROP INDEX "_cases_v_autosave_idx";
  DROP INDEX "_cases_v_version_version_slug_idx";
  DROP INDEX "_cases_v_locales_locale_parent_id_unique";
  DROP INDEX "_cases_v_rels_order_idx";
  DROP INDEX "_cases_v_rels_parent_idx";
  DROP INDEX "_cases_v_rels_path_idx";
  DROP INDEX "_cases_v_rels_persons_id_idx";
  DROP INDEX "_cases_v_rels_organizations_id_idx";
  DROP INDEX "payload_locked_documents_rels_cases_id_idx";
  ALTER TABLE "articles_rels" ADD CONSTRAINT "articles_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_rels" ADD CONSTRAINT "_articles_v_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media_rels" ADD CONSTRAINT "media_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "notes_rels" ADD CONSTRAINT "notes_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_blocks_content" ADD CONSTRAINT "projects_blocks_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_blocks_content_locales" ADD CONSTRAINT "projects_blocks_content_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects_blocks_content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_partners" ADD CONSTRAINT "projects_partners_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_partners_locales" ADD CONSTRAINT "projects_partners_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects_partners"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects" ADD CONSTRAINT "projects_tenant_id_websites_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."websites"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects" ADD CONSTRAINT "projects_image_media_id_media_id_fk" FOREIGN KEY ("image_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects" ADD CONSTRAINT "projects_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects_locales" ADD CONSTRAINT "projects_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_rels" ADD CONSTRAINT "projects_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_rels" ADD CONSTRAINT "projects_rels_persons_fk" FOREIGN KEY ("persons_id") REFERENCES "public"."persons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_rels" ADD CONSTRAINT "projects_rels_organizations_fk" FOREIGN KEY ("organizations_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_blocks_content" ADD CONSTRAINT "_projects_v_blocks_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_blocks_content_locales" ADD CONSTRAINT "_projects_v_blocks_content_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v_blocks_content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_version_partners" ADD CONSTRAINT "_projects_v_version_partners_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_version_partners_locales" ADD CONSTRAINT "_projects_v_version_partners_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v_version_partners"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v" ADD CONSTRAINT "_projects_v_parent_id_projects_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v" ADD CONSTRAINT "_projects_v_version_tenant_id_websites_id_fk" FOREIGN KEY ("version_tenant_id") REFERENCES "public"."websites"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v" ADD CONSTRAINT "_projects_v_version_image_media_id_media_id_fk" FOREIGN KEY ("version_image_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v" ADD CONSTRAINT "_projects_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v_locales" ADD CONSTRAINT "_projects_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_rels" ADD CONSTRAINT "_projects_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_rels" ADD CONSTRAINT "_projects_v_rels_persons_fk" FOREIGN KEY ("persons_id") REFERENCES "public"."persons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_rels" ADD CONSTRAINT "_projects_v_rels_organizations_fk" FOREIGN KEY ("organizations_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "articles_rels_projects_id_idx" ON "articles_rels" USING btree ("projects_id");
  CREATE INDEX "_articles_v_rels_projects_id_idx" ON "_articles_v_rels" USING btree ("projects_id");
  CREATE INDEX "media_rels_projects_id_idx" ON "media_rels" USING btree ("projects_id");
  CREATE INDEX "notes_rels_projects_id_idx" ON "notes_rels" USING btree ("projects_id");
  CREATE INDEX "projects_blocks_content_order_idx" ON "projects_blocks_content" USING btree ("_order");
  CREATE INDEX "projects_blocks_content_parent_id_idx" ON "projects_blocks_content" USING btree ("_parent_id");
  CREATE INDEX "projects_blocks_content_path_idx" ON "projects_blocks_content" USING btree ("_path");
  CREATE UNIQUE INDEX "projects_blocks_content_locales_locale_parent_id_unique" ON "projects_blocks_content_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "projects_partners_order_idx" ON "projects_partners" USING btree ("_order");
  CREATE INDEX "projects_partners_parent_id_idx" ON "projects_partners" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "projects_partners_locales_locale_parent_id_unique" ON "projects_partners_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "projects_tenant_idx" ON "projects" USING btree ("tenant_id");
  CREATE INDEX "projects_image_image_media_idx" ON "projects" USING btree ("image_media_id");
  CREATE UNIQUE INDEX "projects_resource_id_idx" ON "projects" USING btree ("resource_id");
  CREATE INDEX "projects_meta_meta_image_idx" ON "projects" USING btree ("meta_image_id");
  CREATE INDEX "projects_updated_at_idx" ON "projects" USING btree ("updated_at");
  CREATE INDEX "projects_created_at_idx" ON "projects" USING btree ("created_at");
  CREATE INDEX "projects__status_idx" ON "projects" USING btree ("_status");
  CREATE INDEX "projects_slug_idx" ON "projects_locales" USING btree ("slug","_locale");
  CREATE UNIQUE INDEX "projects_locales_locale_parent_id_unique" ON "projects_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "projects_rels_order_idx" ON "projects_rels" USING btree ("order");
  CREATE INDEX "projects_rels_parent_idx" ON "projects_rels" USING btree ("parent_id");
  CREATE INDEX "projects_rels_path_idx" ON "projects_rels" USING btree ("path");
  CREATE INDEX "projects_rels_persons_id_idx" ON "projects_rels" USING btree ("persons_id");
  CREATE INDEX "projects_rels_organizations_id_idx" ON "projects_rels" USING btree ("organizations_id");
  CREATE INDEX "_projects_v_blocks_content_order_idx" ON "_projects_v_blocks_content" USING btree ("_order");
  CREATE INDEX "_projects_v_blocks_content_parent_id_idx" ON "_projects_v_blocks_content" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_blocks_content_path_idx" ON "_projects_v_blocks_content" USING btree ("_path");
  CREATE UNIQUE INDEX "_projects_v_blocks_content_locales_locale_parent_id_unique" ON "_projects_v_blocks_content_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_projects_v_version_partners_order_idx" ON "_projects_v_version_partners" USING btree ("_order");
  CREATE INDEX "_projects_v_version_partners_parent_id_idx" ON "_projects_v_version_partners" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_projects_v_version_partners_locales_locale_parent_id_unique" ON "_projects_v_version_partners_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_projects_v_parent_idx" ON "_projects_v" USING btree ("parent_id");
  CREATE INDEX "_projects_v_version_version_tenant_idx" ON "_projects_v" USING btree ("version_tenant_id");
  CREATE INDEX "_projects_v_version_image_version_image_media_idx" ON "_projects_v" USING btree ("version_image_media_id");
  CREATE INDEX "_projects_v_version_version_resource_id_idx" ON "_projects_v" USING btree ("version_resource_id");
  CREATE INDEX "_projects_v_version_meta_version_meta_image_idx" ON "_projects_v" USING btree ("version_meta_image_id");
  CREATE INDEX "_projects_v_version_version_updated_at_idx" ON "_projects_v" USING btree ("version_updated_at");
  CREATE INDEX "_projects_v_version_version_created_at_idx" ON "_projects_v" USING btree ("version_created_at");
  CREATE INDEX "_projects_v_version_version__status_idx" ON "_projects_v" USING btree ("version__status");
  CREATE INDEX "_projects_v_created_at_idx" ON "_projects_v" USING btree ("created_at");
  CREATE INDEX "_projects_v_updated_at_idx" ON "_projects_v" USING btree ("updated_at");
  CREATE INDEX "_projects_v_snapshot_idx" ON "_projects_v" USING btree ("snapshot");
  CREATE INDEX "_projects_v_published_locale_idx" ON "_projects_v" USING btree ("published_locale");
  CREATE INDEX "_projects_v_latest_idx" ON "_projects_v" USING btree ("latest");
  CREATE INDEX "_projects_v_autosave_idx" ON "_projects_v" USING btree ("autosave");
  CREATE INDEX "_projects_v_version_version_slug_idx" ON "_projects_v_locales" USING btree ("version_slug","_locale");
  CREATE UNIQUE INDEX "_projects_v_locales_locale_parent_id_unique" ON "_projects_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_projects_v_rels_order_idx" ON "_projects_v_rels" USING btree ("order");
  CREATE INDEX "_projects_v_rels_parent_idx" ON "_projects_v_rels" USING btree ("parent_id");
  CREATE INDEX "_projects_v_rels_path_idx" ON "_projects_v_rels" USING btree ("path");
  CREATE INDEX "_projects_v_rels_persons_id_idx" ON "_projects_v_rels" USING btree ("persons_id");
  CREATE INDEX "_projects_v_rels_organizations_id_idx" ON "_projects_v_rels" USING btree ("organizations_id");
  CREATE INDEX "payload_locked_documents_rels_projects_id_idx" ON "payload_locked_documents_rels" USING btree ("projects_id");`)
}
