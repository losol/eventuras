import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "articles_blocks_products" ADD COLUMN "show_image" boolean DEFAULT true;
  ALTER TABLE "_articles_v_blocks_products" ADD COLUMN "show_image" boolean DEFAULT true;
  ALTER TABLE "pages_blocks_products" ADD COLUMN "show_image" boolean DEFAULT true;
  ALTER TABLE "_pages_v_blocks_products" ADD COLUMN "show_image" boolean DEFAULT true;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "articles_blocks_products" DROP COLUMN "show_image";
  ALTER TABLE "_articles_v_blocks_products" DROP COLUMN "show_image";
  ALTER TABLE "pages_blocks_products" DROP COLUMN "show_image";
  ALTER TABLE "_pages_v_blocks_products" DROP COLUMN "show_image";`)
}
