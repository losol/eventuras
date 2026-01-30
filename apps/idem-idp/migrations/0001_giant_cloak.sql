DROP INDEX "idem"."idx_oidc_store_name_oidc_id";--> statement-breakpoint
ALTER TABLE "idem"."oidc_store" ADD CONSTRAINT "idx_oidc_store_name_oidc_id_unique" UNIQUE("name","oidc_id");