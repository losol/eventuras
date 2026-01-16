import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "media" RENAME COLUMN "sizes_square1080_url" TO "sizes_square_url";
  ALTER TABLE "media" RENAME COLUMN "sizes_square1080_width" TO "sizes_square_width";
  ALTER TABLE "media" RENAME COLUMN "sizes_square1080_height" TO "sizes_square_height";
  ALTER TABLE "media" RENAME COLUMN "sizes_square1080_mime_type" TO "sizes_square_mime_type";
  ALTER TABLE "media" RENAME COLUMN "sizes_square1080_filesize" TO "sizes_square_filesize";
  ALTER TABLE "media" RENAME COLUMN "sizes_square1080_filename" TO "sizes_square_filename";
  ALTER TABLE "media" RENAME COLUMN "sizes_standard_url" TO "sizes_landscape_url";
  ALTER TABLE "media" RENAME COLUMN "sizes_standard_width" TO "sizes_landscape_width";
  ALTER TABLE "media" RENAME COLUMN "sizes_standard_height" TO "sizes_landscape_height";
  ALTER TABLE "media" RENAME COLUMN "sizes_standard_mime_type" TO "sizes_landscape_mime_type";
  ALTER TABLE "media" RENAME COLUMN "sizes_standard_filesize" TO "sizes_landscape_filesize";
  ALTER TABLE "media" RENAME COLUMN "sizes_standard_filename" TO "sizes_landscape_filename";
  DROP INDEX "media_sizes_square1080_sizes_square1080_filename_idx";
  DROP INDEX "media_sizes_standard_sizes_standard_filename_idx";
  ALTER TABLE "articles" ADD COLUMN "meta_image_id" uuid;
  ALTER TABLE "articles_locales" ADD COLUMN "meta_title" varchar;
  ALTER TABLE "articles_locales" ADD COLUMN "meta_description" varchar;
  ALTER TABLE "_articles_v" ADD COLUMN "version_meta_image_id" uuid;
  ALTER TABLE "_articles_v_locales" ADD COLUMN "version_meta_title" varchar;
  ALTER TABLE "_articles_v_locales" ADD COLUMN "version_meta_description" varchar;
  ALTER TABLE "happenings" ADD COLUMN "meta_image_id" uuid;
  ALTER TABLE "happenings_locales" ADD COLUMN "meta_title" varchar;
  ALTER TABLE "happenings_locales" ADD COLUMN "meta_description" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_social_share_url" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_social_share_width" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_social_share_height" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_social_share_mime_type" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_social_share_filesize" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_social_share_filename" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_vertical_story_url" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_vertical_story_width" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_vertical_story_height" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_vertical_story_mime_type" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_vertical_story_filesize" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_vertical_story_filename" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_banner_url" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_banner_width" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_banner_height" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_banner_mime_type" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_banner_filesize" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_banner_filename" varchar;
  ALTER TABLE "notes" ADD COLUMN "meta_image_id" uuid;
  ALTER TABLE "notes_locales" ADD COLUMN "meta_title" varchar;
  ALTER TABLE "notes_locales" ADD COLUMN "meta_description" varchar;
  ALTER TABLE "pages" ADD COLUMN "meta_image_id" uuid;
  ALTER TABLE "pages_locales" ADD COLUMN "meta_title" varchar;
  ALTER TABLE "pages_locales" ADD COLUMN "meta_description" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_meta_image_id" uuid;
  ALTER TABLE "_pages_v_locales" ADD COLUMN "version_meta_title" varchar;
  ALTER TABLE "_pages_v_locales" ADD COLUMN "version_meta_description" varchar;
  ALTER TABLE "products" ADD COLUMN "meta_image_id" uuid;
  ALTER TABLE "products_locales" ADD COLUMN "meta_title" varchar;
  ALTER TABLE "products_locales" ADD COLUMN "meta_description" varchar;
  ALTER TABLE "_products_v" ADD COLUMN "version_meta_image_id" uuid;
  ALTER TABLE "_products_v_locales" ADD COLUMN "version_meta_title" varchar;
  ALTER TABLE "_products_v_locales" ADD COLUMN "version_meta_description" varchar;
  ALTER TABLE "projects" ADD COLUMN "meta_image_id" uuid;
  ALTER TABLE "projects_locales" ADD COLUMN "meta_title" varchar;
  ALTER TABLE "projects_locales" ADD COLUMN "meta_description" varchar;
  ALTER TABLE "_projects_v" ADD COLUMN "version_meta_image_id" uuid;
  ALTER TABLE "_projects_v_locales" ADD COLUMN "version_meta_title" varchar;
  ALTER TABLE "_projects_v_locales" ADD COLUMN "version_meta_description" varchar;
  ALTER TABLE "articles" ADD CONSTRAINT "articles_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v" ADD CONSTRAINT "_articles_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "happenings" ADD CONSTRAINT "happenings_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "notes" ADD CONSTRAINT "notes_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products" ADD CONSTRAINT "products_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects" ADD CONSTRAINT "projects_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v" ADD CONSTRAINT "_projects_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "articles_meta_meta_image_idx" ON "articles" USING btree ("meta_image_id");
  CREATE INDEX "_articles_v_version_meta_version_meta_image_idx" ON "_articles_v" USING btree ("version_meta_image_id");
  CREATE INDEX "happenings_meta_meta_image_idx" ON "happenings" USING btree ("meta_image_id");
  CREATE INDEX "media_sizes_square_sizes_square_filename_idx" ON "media" USING btree ("sizes_square_filename");
  CREATE INDEX "media_sizes_landscape_sizes_landscape_filename_idx" ON "media" USING btree ("sizes_landscape_filename");
  CREATE INDEX "media_sizes_social_share_sizes_social_share_filename_idx" ON "media" USING btree ("sizes_social_share_filename");
  CREATE INDEX "media_sizes_vertical_story_sizes_vertical_story_filename_idx" ON "media" USING btree ("sizes_vertical_story_filename");
  CREATE INDEX "media_sizes_banner_sizes_banner_filename_idx" ON "media" USING btree ("sizes_banner_filename");
  CREATE INDEX "notes_meta_meta_image_idx" ON "notes" USING btree ("meta_image_id");
  CREATE INDEX "pages_meta_meta_image_idx" ON "pages" USING btree ("meta_image_id");
  CREATE INDEX "_pages_v_version_meta_version_meta_image_idx" ON "_pages_v" USING btree ("version_meta_image_id");
  CREATE INDEX "products_meta_meta_image_idx" ON "products" USING btree ("meta_image_id");
  CREATE INDEX "_products_v_version_meta_version_meta_image_idx" ON "_products_v" USING btree ("version_meta_image_id");
  CREATE INDEX "projects_meta_meta_image_idx" ON "projects" USING btree ("meta_image_id");
  CREATE INDEX "_projects_v_version_meta_version_meta_image_idx" ON "_projects_v" USING btree ("version_meta_image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "media" RENAME COLUMN "sizes_square_url" TO "sizes_square1080_url";
  ALTER TABLE "media" RENAME COLUMN "sizes_square_width" TO "sizes_square1080_width";
  ALTER TABLE "media" RENAME COLUMN "sizes_square_height" TO "sizes_square1080_height";
  ALTER TABLE "media" RENAME COLUMN "sizes_square_mime_type" TO "sizes_square1080_mime_type";
  ALTER TABLE "media" RENAME COLUMN "sizes_square_filesize" TO "sizes_square1080_filesize";
  ALTER TABLE "media" RENAME COLUMN "sizes_square_filename" TO "sizes_square1080_filename";
  ALTER TABLE "media" RENAME COLUMN "sizes_landscape_url" TO "sizes_standard_url";
  ALTER TABLE "media" RENAME COLUMN "sizes_landscape_width" TO "sizes_standard_width";
  ALTER TABLE "media" RENAME COLUMN "sizes_landscape_height" TO "sizes_standard_height";
  ALTER TABLE "media" RENAME COLUMN "sizes_landscape_mime_type" TO "sizes_standard_mime_type";
  ALTER TABLE "media" RENAME COLUMN "sizes_landscape_filesize" TO "sizes_standard_filesize";
  ALTER TABLE "media" RENAME COLUMN "sizes_landscape_filename" TO "sizes_standard_filename";
  ALTER TABLE "articles" DROP CONSTRAINT "articles_meta_image_id_media_id_fk";
  
  ALTER TABLE "_articles_v" DROP CONSTRAINT "_articles_v_version_meta_image_id_media_id_fk";
  
  ALTER TABLE "happenings" DROP CONSTRAINT "happenings_meta_image_id_media_id_fk";
  
  ALTER TABLE "notes" DROP CONSTRAINT "notes_meta_image_id_media_id_fk";
  
  ALTER TABLE "pages" DROP CONSTRAINT "pages_meta_image_id_media_id_fk";
  
  ALTER TABLE "_pages_v" DROP CONSTRAINT "_pages_v_version_meta_image_id_media_id_fk";
  
  ALTER TABLE "products" DROP CONSTRAINT "products_meta_image_id_media_id_fk";
  
  ALTER TABLE "_products_v" DROP CONSTRAINT "_products_v_version_meta_image_id_media_id_fk";
  
  ALTER TABLE "projects" DROP CONSTRAINT "projects_meta_image_id_media_id_fk";
  
  ALTER TABLE "_projects_v" DROP CONSTRAINT "_projects_v_version_meta_image_id_media_id_fk";
  
  DROP INDEX "articles_meta_meta_image_idx";
  DROP INDEX "_articles_v_version_meta_version_meta_image_idx";
  DROP INDEX "happenings_meta_meta_image_idx";
  DROP INDEX "media_sizes_square_sizes_square_filename_idx";
  DROP INDEX "media_sizes_landscape_sizes_landscape_filename_idx";
  DROP INDEX "media_sizes_social_share_sizes_social_share_filename_idx";
  DROP INDEX "media_sizes_vertical_story_sizes_vertical_story_filename_idx";
  DROP INDEX "media_sizes_banner_sizes_banner_filename_idx";
  DROP INDEX "notes_meta_meta_image_idx";
  DROP INDEX "pages_meta_meta_image_idx";
  DROP INDEX "_pages_v_version_meta_version_meta_image_idx";
  DROP INDEX "products_meta_meta_image_idx";
  DROP INDEX "_products_v_version_meta_version_meta_image_idx";
  DROP INDEX "projects_meta_meta_image_idx";
  DROP INDEX "_projects_v_version_meta_version_meta_image_idx";
  CREATE INDEX "media_sizes_square1080_sizes_square1080_filename_idx" ON "media" USING btree ("sizes_square1080_filename");
  CREATE INDEX "media_sizes_standard_sizes_standard_filename_idx" ON "media" USING btree ("sizes_standard_filename");
  ALTER TABLE "articles" DROP COLUMN "meta_image_id";
  ALTER TABLE "articles_locales" DROP COLUMN "meta_title";
  ALTER TABLE "articles_locales" DROP COLUMN "meta_description";
  ALTER TABLE "_articles_v" DROP COLUMN "version_meta_image_id";
  ALTER TABLE "_articles_v_locales" DROP COLUMN "version_meta_title";
  ALTER TABLE "_articles_v_locales" DROP COLUMN "version_meta_description";
  ALTER TABLE "happenings" DROP COLUMN "meta_image_id";
  ALTER TABLE "happenings_locales" DROP COLUMN "meta_title";
  ALTER TABLE "happenings_locales" DROP COLUMN "meta_description";
  ALTER TABLE "media" DROP COLUMN "sizes_social_share_url";
  ALTER TABLE "media" DROP COLUMN "sizes_social_share_width";
  ALTER TABLE "media" DROP COLUMN "sizes_social_share_height";
  ALTER TABLE "media" DROP COLUMN "sizes_social_share_mime_type";
  ALTER TABLE "media" DROP COLUMN "sizes_social_share_filesize";
  ALTER TABLE "media" DROP COLUMN "sizes_social_share_filename";
  ALTER TABLE "media" DROP COLUMN "sizes_vertical_story_url";
  ALTER TABLE "media" DROP COLUMN "sizes_vertical_story_width";
  ALTER TABLE "media" DROP COLUMN "sizes_vertical_story_height";
  ALTER TABLE "media" DROP COLUMN "sizes_vertical_story_mime_type";
  ALTER TABLE "media" DROP COLUMN "sizes_vertical_story_filesize";
  ALTER TABLE "media" DROP COLUMN "sizes_vertical_story_filename";
  ALTER TABLE "media" DROP COLUMN "sizes_banner_url";
  ALTER TABLE "media" DROP COLUMN "sizes_banner_width";
  ALTER TABLE "media" DROP COLUMN "sizes_banner_height";
  ALTER TABLE "media" DROP COLUMN "sizes_banner_mime_type";
  ALTER TABLE "media" DROP COLUMN "sizes_banner_filesize";
  ALTER TABLE "media" DROP COLUMN "sizes_banner_filename";
  ALTER TABLE "notes" DROP COLUMN "meta_image_id";
  ALTER TABLE "notes_locales" DROP COLUMN "meta_title";
  ALTER TABLE "notes_locales" DROP COLUMN "meta_description";
  ALTER TABLE "pages" DROP COLUMN "meta_image_id";
  ALTER TABLE "pages_locales" DROP COLUMN "meta_title";
  ALTER TABLE "pages_locales" DROP COLUMN "meta_description";
  ALTER TABLE "_pages_v" DROP COLUMN "version_meta_image_id";
  ALTER TABLE "_pages_v_locales" DROP COLUMN "version_meta_title";
  ALTER TABLE "_pages_v_locales" DROP COLUMN "version_meta_description";
  ALTER TABLE "products" DROP COLUMN "meta_image_id";
  ALTER TABLE "products_locales" DROP COLUMN "meta_title";
  ALTER TABLE "products_locales" DROP COLUMN "meta_description";
  ALTER TABLE "_products_v" DROP COLUMN "version_meta_image_id";
  ALTER TABLE "_products_v_locales" DROP COLUMN "version_meta_title";
  ALTER TABLE "_products_v_locales" DROP COLUMN "version_meta_description";
  ALTER TABLE "projects" DROP COLUMN "meta_image_id";
  ALTER TABLE "projects_locales" DROP COLUMN "meta_title";
  ALTER TABLE "projects_locales" DROP COLUMN "meta_description";
  ALTER TABLE "_projects_v" DROP COLUMN "version_meta_image_id";
  ALTER TABLE "_projects_v_locales" DROP COLUMN "version_meta_title";
  ALTER TABLE "_projects_v_locales" DROP COLUMN "version_meta_description";`)
}
