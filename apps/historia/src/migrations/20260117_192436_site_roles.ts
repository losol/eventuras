import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_users_tenants_roles" RENAME TO "enum_users_tenants_site_roles";
  ALTER TABLE "users_tenants_roles" RENAME TO "users_tenants_site_roles";
  ALTER TABLE "users_tenants_site_roles" DROP CONSTRAINT "users_tenants_roles_parent_fk";
  
  ALTER TABLE "users_tenants_site_roles" ALTER COLUMN "value" SET DATA TYPE text;
  DROP TYPE "public"."enum_users_tenants_site_roles";
  CREATE TYPE "public"."enum_users_tenants_site_roles" AS ENUM('admin', 'editor', 'commerce', 'member');
  ALTER TABLE "users_tenants_site_roles" ALTER COLUMN "value" SET DATA TYPE "public"."enum_users_tenants_site_roles" USING "value"::"public"."enum_users_tenants_site_roles";
  DROP INDEX "users_tenants_roles_order_idx";
  DROP INDEX "users_tenants_roles_parent_idx";
  ALTER TABLE "users_tenants_site_roles" ADD CONSTRAINT "users_tenants_site_roles_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users_tenants"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_tenants_site_roles_order_idx" ON "users_tenants_site_roles" USING btree ("order");
  CREATE INDEX "users_tenants_site_roles_parent_idx" ON "users_tenants_site_roles" USING btree ("parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_users_tenants_site_roles" RENAME TO "enum_users_tenants_roles";
  ALTER TABLE "users_tenants_site_roles" RENAME TO "users_tenants_roles";
  ALTER TABLE "users_tenants_roles" DROP CONSTRAINT "users_tenants_site_roles_parent_fk";
  
  ALTER TABLE "users_tenants_roles" ALTER COLUMN "value" SET DATA TYPE text;
  DROP TYPE "public"."enum_users_tenants_roles";
  CREATE TYPE "public"."enum_users_tenants_roles" AS ENUM('site-admin', 'site-member');
  ALTER TABLE "users_tenants_roles" ALTER COLUMN "value" SET DATA TYPE "public"."enum_users_tenants_roles" USING "value"::"public"."enum_users_tenants_roles";
  DROP INDEX "users_tenants_site_roles_order_idx";
  DROP INDEX "users_tenants_site_roles_parent_idx";
  ALTER TABLE "users_tenants_roles" ADD CONSTRAINT "users_tenants_roles_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users_tenants"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_tenants_roles_order_idx" ON "users_tenants_roles" USING btree ("order");
  CREATE INDEX "users_tenants_roles_parent_idx" ON "users_tenants_roles" USING btree ("parent_id");`)
}
