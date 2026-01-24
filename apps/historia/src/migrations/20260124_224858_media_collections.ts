import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "media_collections_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "media_collections_rels" CASCADE;
  ALTER TABLE "media" DROP CONSTRAINT "media_collection_id_media_collections_id_fk";
  
  DROP INDEX "media_collection_idx";
  ALTER TABLE "media_rels" ADD COLUMN "media_collections_id" uuid;
  ALTER TABLE "media_collections" ADD COLUMN "slug_lock" boolean DEFAULT true;
  ALTER TABLE "media_collections_locales" ADD COLUMN "slug" varchar;
  ALTER TABLE "media_rels" ADD CONSTRAINT "media_rels_media_collections_fk" FOREIGN KEY ("media_collections_id") REFERENCES "public"."media_collections"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "media_rels_media_collections_id_idx" ON "media_rels" USING btree ("media_collections_id");
  CREATE INDEX "media_collections_slug_idx" ON "media_collections_locales" USING btree ("slug","_locale");
  ALTER TABLE "media" DROP COLUMN "collection_id";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "media_collections_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" uuid NOT NULL,
  	"path" varchar NOT NULL,
  	"websites_id" uuid
  );
  
  ALTER TABLE "media_rels" DROP CONSTRAINT "media_rels_media_collections_fk";
  
  DROP INDEX "media_rels_media_collections_id_idx";
  DROP INDEX "media_collections_slug_idx";
  ALTER TABLE "media" ADD COLUMN "collection_id" uuid;
  ALTER TABLE "media_collections_rels" ADD CONSTRAINT "media_collections_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."media_collections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media_collections_rels" ADD CONSTRAINT "media_collections_rels_websites_fk" FOREIGN KEY ("websites_id") REFERENCES "public"."websites"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "media_collections_rels_order_idx" ON "media_collections_rels" USING btree ("order");
  CREATE INDEX "media_collections_rels_parent_idx" ON "media_collections_rels" USING btree ("parent_id");
  CREATE INDEX "media_collections_rels_path_idx" ON "media_collections_rels" USING btree ("path");
  CREATE INDEX "media_collections_rels_websites_id_idx" ON "media_collections_rels" USING btree ("websites_id");
  ALTER TABLE "media" ADD CONSTRAINT "media_collection_id_media_collections_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."media_collections"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "media_collection_idx" ON "media" USING btree ("collection_id");
  ALTER TABLE "media_rels" DROP COLUMN "media_collections_id";
  ALTER TABLE "media_collections" DROP COLUMN "slug_lock";
  ALTER TABLE "media_collections_locales" DROP COLUMN "slug";`)
}
