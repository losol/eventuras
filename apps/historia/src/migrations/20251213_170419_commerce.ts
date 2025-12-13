import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_orders_status" AS ENUM('pending', 'processing', 'on-hold', 'completed', 'canceled');
  CREATE TYPE "public"."enum_products_product_type" AS ENUM('physical', 'digital', 'shipping', 'service');
  CREATE TYPE "public"."enum_products_price_currency" AS ENUM('NOK', 'USD', 'EUR', 'GBP', 'SEK', 'DKK');
  CREATE TYPE "public"."enum_products_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__products_v_version_product_type" AS ENUM('physical', 'digital', 'shipping', 'service');
  CREATE TYPE "public"."enum__products_v_version_price_currency" AS ENUM('NOK', 'USD', 'EUR', 'GBP', 'SEK', 'DKK');
  CREATE TYPE "public"."enum__products_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__products_v_published_locale" AS ENUM('no', 'en');
  CREATE TYPE "public"."enum_shipments_status" AS ENUM('pending', 'processing', 'ready-to-ship', 'shipped', 'in-transit', 'out-for-delivery', 'delivered', 'attempted-delivery', 'available-for-pickup', 'returned-to-sender', 'lost-in-transit', 'canceled');
  CREATE TYPE "public"."enum_shipments_shipment_type" AS ENUM('full', 'partial');
  CREATE TYPE "public"."enum_transactions_currency" AS ENUM('NOK', 'USD', 'EUR', 'GBP', 'SEK', 'DKK');
  CREATE TYPE "public"."enum_websites_blocks_separator_style" AS ENUM('line', 'space', 'dots');
  CREATE TABLE "articles_blocks_image" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" uuid,
  	"block_name" varchar
  );
  
  CREATE TABLE "articles_blocks_image_locales" (
  	"caption" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "articles_blocks_products" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "_articles_v_blocks_image" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"_path" text NOT NULL,
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"media_id" uuid,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_articles_v_blocks_image_locales" (
  	"caption" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" uuid NOT NULL
  );
  
  CREATE TABLE "_articles_v_blocks_products" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"_path" text NOT NULL,
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "business_events" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"event_type" varchar NOT NULL,
  	"source" varchar,
  	"actor_id" uuid,
  	"external_id" varchar,
  	"external_reference" varchar,
  	"data" jsonb NOT NULL,
  	"error" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "business_events_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" uuid NOT NULL,
  	"path" varchar NOT NULL,
  	"orders_id" uuid,
  	"transactions_id" uuid,
  	"users_id" uuid,
  	"products_id" uuid
  );
  
  CREATE TABLE "orders_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"item_id" varchar NOT NULL,
  	"product_id" uuid NOT NULL,
  	"quantity" numeric DEFAULT 1 NOT NULL,
  	"price_amount_ex_vat" numeric NOT NULL,
  	"price_currency" varchar DEFAULT 'NOK' NOT NULL,
  	"price_vat_rate" numeric DEFAULT 25 NOT NULL,
  	"line_total" numeric
  );
  
  CREATE TABLE "orders" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"tenant_id" uuid,
  	"shipping_address_address_line1" varchar,
  	"shipping_address_address_line2" varchar,
  	"shipping_address_postal_code" varchar,
  	"shipping_address_city" varchar,
  	"shipping_address_country" varchar DEFAULT 'NO',
  	"customer_id" uuid,
  	"user_email" varchar NOT NULL,
  	"status" "enum_orders_status" DEFAULT 'pending' NOT NULL,
  	"total_amount" numeric,
  	"currency" varchar DEFAULT 'NOK' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "pages_blocks_image" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" uuid,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_image_locales" (
  	"caption" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_products" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_image" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"_path" text NOT NULL,
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"media_id" uuid,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_image_locales" (
  	"caption" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" uuid NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_products" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"_path" text NOT NULL,
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "products_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" uuid
  );
  
  CREATE TABLE "products_gallery_locales" (
  	"caption" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "products_blocks_content" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "products_blocks_content_locales" (
  	"rich_text" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "products" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"tenant_id" uuid,
  	"image_media_id" uuid,
  	"product_type" "enum_products_product_type" DEFAULT 'physical',
  	"price_amount_ex_vat" numeric,
  	"price_currency" "enum_products_price_currency" DEFAULT 'NOK',
  	"price_vat_rate" numeric DEFAULT 25,
  	"sku" varchar,
  	"inventory" numeric,
  	"slug_lock" boolean DEFAULT true,
  	"resource_id" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_products_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "products_locales" (
  	"title" varchar,
  	"lead" varchar,
  	"description" jsonb,
  	"image_caption" jsonb,
  	"slug" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" uuid NOT NULL
  );
  
  CREATE TABLE "_products_v_version_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"media_id" uuid,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v_version_gallery_locales" (
  	"caption" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" uuid NOT NULL
  );
  
  CREATE TABLE "_products_v_blocks_content" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"_path" text NOT NULL,
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_products_v_blocks_content_locales" (
  	"rich_text" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" uuid NOT NULL
  );
  
  CREATE TABLE "_products_v" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"parent_id" uuid,
  	"version_tenant_id" uuid,
  	"version_image_media_id" uuid,
  	"version_product_type" "enum__products_v_version_product_type" DEFAULT 'physical',
  	"version_price_amount_ex_vat" numeric,
  	"version_price_currency" "enum__products_v_version_price_currency" DEFAULT 'NOK',
  	"version_price_vat_rate" numeric DEFAULT 25,
  	"version_sku" varchar,
  	"version_inventory" numeric,
  	"version_slug_lock" boolean DEFAULT true,
  	"version_resource_id" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__products_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__products_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_products_v_locales" (
  	"version_title" varchar,
  	"version_lead" varchar,
  	"version_description" jsonb,
  	"version_image_caption" jsonb,
  	"version_slug" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" uuid NOT NULL
  );
  
  CREATE TABLE "shipments_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"order_item_id" varchar NOT NULL,
  	"product_id" uuid NOT NULL,
  	"quantity" numeric DEFAULT 1 NOT NULL
  );
  
  CREATE TABLE "shipments" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"tenant_id" uuid,
  	"order_id" uuid NOT NULL,
  	"shipping_address_address_line1" varchar,
  	"shipping_address_address_line2" varchar,
  	"shipping_address_postal_code" varchar,
  	"shipping_address_city" varchar,
  	"shipping_address_country" varchar DEFAULT 'NO',
  	"carrier" varchar,
  	"tracking_number" varchar,
  	"tracking_url" varchar,
  	"shipped_at" timestamp(3) with time zone,
  	"delivered_at" timestamp(3) with time zone,
  	"notes" varchar,
  	"status" "enum_shipments_status" DEFAULT 'pending' NOT NULL,
  	"shipment_type" "enum_shipments_shipment_type" DEFAULT 'full' NOT NULL,
  	"weight" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "transactions" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"tenant_id" uuid,
  	"order_id" uuid NOT NULL,
  	"customer_id" uuid,
  	"amount" numeric NOT NULL,
  	"currency" "enum_transactions_currency" DEFAULT 'NOK' NOT NULL,
  	"payment_reference" varchar NOT NULL,
  	"status" varchar DEFAULT 'pending' NOT NULL,
  	"payment_method" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "users_addresses" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"is_default" boolean DEFAULT false,
  	"address_line1" varchar,
  	"address_line2" varchar,
  	"postal_code" varchar,
  	"city" varchar,
  	"country" varchar DEFAULT 'NO'
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "websites_blocks_internal_link" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL,
  	"page_id" uuid NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "websites_blocks_external_link" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL,
  	"url" varchar,
  	"open_in_new_tab" boolean DEFAULT true,
  	"block_name" varchar
  );
  
  CREATE TABLE "websites_blocks_separator" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"style" "enum_websites_blocks_separator_style" DEFAULT 'line',
  	"block_name" varchar
  );
  
  CREATE TABLE "websites_blocks_nav" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "payload_kv" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  ALTER TABLE "happenings_blocks_session_schedule_contributors_locales" DROP CONSTRAINT "happenings_blocks_session_schedule_contributors_locales_parent_id_fk";
  
  ALTER TABLE "places" DROP CONSTRAINT "places_tenant_id_websites_id_fk";
  
  DROP INDEX "_articles_v_version_contributors_locales_locale_parent_id_unique";
  DROP INDEX "happenings_blocks_session_schedule_contributors_locales_locale_parent_id_unique";
  DROP INDEX "happenings_blocks_session_schedule_locales_locale_parent_id_unique";
  DROP INDEX "_pages_v_version_contributors_locales_locale_parent_id_unique";
  DROP INDEX "places_tenant_idx";
  DROP INDEX "websites_texts_order_parent_idx";
  DROP INDEX "redirects_from_idx";
  ALTER TABLE "forms_emails_locales" ALTER COLUMN "subject" SET DEFAULT 'You''ve received a new message.';
  ALTER TABLE "articles_rels" ADD COLUMN "products_id" uuid;
  ALTER TABLE "_articles_v_rels" ADD COLUMN "products_id" uuid;
  ALTER TABLE "organizations" ADD COLUMN "organization_number" varchar;
  ALTER TABLE "organizations" ADD COLUMN "url" varchar;
  ALTER TABLE "organizations" ADD COLUMN "email" varchar;
  ALTER TABLE "organizations" ADD COLUMN "phone" varchar;
  ALTER TABLE "organizations" ADD COLUMN "address_address_line1" varchar;
  ALTER TABLE "organizations" ADD COLUMN "address_address_line2" varchar;
  ALTER TABLE "organizations" ADD COLUMN "address_postal_code" varchar;
  ALTER TABLE "organizations" ADD COLUMN "address_city" varchar;
  ALTER TABLE "organizations" ADD COLUMN "address_country" varchar DEFAULT 'NO';
  ALTER TABLE "pages_rels" ADD COLUMN "products_id" uuid;
  ALTER TABLE "_pages_v_rels" ADD COLUMN "products_id" uuid;
  ALTER TABLE "websites" ADD COLUMN "publisher_id" uuid;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "business_events_id" uuid;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "orders_id" uuid;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "products_id" uuid;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "shipments_id" uuid;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "transactions_id" uuid;
  ALTER TABLE "articles_blocks_image" ADD CONSTRAINT "articles_blocks_image_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles_blocks_image" ADD CONSTRAINT "articles_blocks_image_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_blocks_image_locales" ADD CONSTRAINT "articles_blocks_image_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles_blocks_image"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_blocks_products" ADD CONSTRAINT "articles_blocks_products_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_image" ADD CONSTRAINT "_articles_v_blocks_image_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_image" ADD CONSTRAINT "_articles_v_blocks_image_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_image_locales" ADD CONSTRAINT "_articles_v_blocks_image_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_articles_v_blocks_image"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_products" ADD CONSTRAINT "_articles_v_blocks_products_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "business_events" ADD CONSTRAINT "business_events_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "business_events_rels" ADD CONSTRAINT "business_events_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."business_events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "business_events_rels" ADD CONSTRAINT "business_events_rels_orders_fk" FOREIGN KEY ("orders_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "business_events_rels" ADD CONSTRAINT "business_events_rels_transactions_fk" FOREIGN KEY ("transactions_id") REFERENCES "public"."transactions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "business_events_rels" ADD CONSTRAINT "business_events_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "business_events_rels" ADD CONSTRAINT "business_events_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "orders_items" ADD CONSTRAINT "orders_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "orders_items" ADD CONSTRAINT "orders_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "orders" ADD CONSTRAINT "orders_tenant_id_websites_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."websites"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_image" ADD CONSTRAINT "pages_blocks_image_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_image" ADD CONSTRAINT "pages_blocks_image_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_image_locales" ADD CONSTRAINT "pages_blocks_image_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_image"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_products" ADD CONSTRAINT "pages_blocks_products_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_image" ADD CONSTRAINT "_pages_v_blocks_image_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_image" ADD CONSTRAINT "_pages_v_blocks_image_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_image_locales" ADD CONSTRAINT "_pages_v_blocks_image_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_image"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_products" ADD CONSTRAINT "_pages_v_blocks_products_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_gallery" ADD CONSTRAINT "products_gallery_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_gallery" ADD CONSTRAINT "products_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_gallery_locales" ADD CONSTRAINT "products_gallery_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_blocks_content" ADD CONSTRAINT "products_blocks_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_blocks_content_locales" ADD CONSTRAINT "products_blocks_content_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products_blocks_content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products" ADD CONSTRAINT "products_tenant_id_websites_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."websites"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products" ADD CONSTRAINT "products_image_media_id_media_id_fk" FOREIGN KEY ("image_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_locales" ADD CONSTRAINT "products_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_gallery" ADD CONSTRAINT "_products_v_version_gallery_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v_version_gallery" ADD CONSTRAINT "_products_v_version_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_gallery_locales" ADD CONSTRAINT "_products_v_version_gallery_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v_version_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_blocks_content" ADD CONSTRAINT "_products_v_blocks_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_blocks_content_locales" ADD CONSTRAINT "_products_v_blocks_content_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v_blocks_content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_parent_id_products_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_version_tenant_id_websites_id_fk" FOREIGN KEY ("version_tenant_id") REFERENCES "public"."websites"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_version_image_media_id_media_id_fk" FOREIGN KEY ("version_image_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v_locales" ADD CONSTRAINT "_products_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "shipments_items" ADD CONSTRAINT "shipments_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "shipments_items" ADD CONSTRAINT "shipments_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."shipments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "shipments" ADD CONSTRAINT "shipments_tenant_id_websites_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."websites"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "shipments" ADD CONSTRAINT "shipments_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "transactions" ADD CONSTRAINT "transactions_tenant_id_websites_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."websites"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "transactions" ADD CONSTRAINT "transactions_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "transactions" ADD CONSTRAINT "transactions_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "users_addresses" ADD CONSTRAINT "users_addresses_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "websites_blocks_internal_link" ADD CONSTRAINT "websites_blocks_internal_link_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "websites_blocks_internal_link" ADD CONSTRAINT "websites_blocks_internal_link_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."websites"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "websites_blocks_external_link" ADD CONSTRAINT "websites_blocks_external_link_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."websites"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "websites_blocks_separator" ADD CONSTRAINT "websites_blocks_separator_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."websites"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "websites_blocks_nav" ADD CONSTRAINT "websites_blocks_nav_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."websites"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "articles_blocks_image_order_idx" ON "articles_blocks_image" USING btree ("_order");
  CREATE INDEX "articles_blocks_image_parent_id_idx" ON "articles_blocks_image" USING btree ("_parent_id");
  CREATE INDEX "articles_blocks_image_path_idx" ON "articles_blocks_image" USING btree ("_path");
  CREATE INDEX "articles_blocks_image_media_idx" ON "articles_blocks_image" USING btree ("media_id");
  CREATE UNIQUE INDEX "articles_blocks_image_locales_locale_parent_id_unique" ON "articles_blocks_image_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "articles_blocks_products_order_idx" ON "articles_blocks_products" USING btree ("_order");
  CREATE INDEX "articles_blocks_products_parent_id_idx" ON "articles_blocks_products" USING btree ("_parent_id");
  CREATE INDEX "articles_blocks_products_path_idx" ON "articles_blocks_products" USING btree ("_path");
  CREATE INDEX "_articles_v_blocks_image_order_idx" ON "_articles_v_blocks_image" USING btree ("_order");
  CREATE INDEX "_articles_v_blocks_image_parent_id_idx" ON "_articles_v_blocks_image" USING btree ("_parent_id");
  CREATE INDEX "_articles_v_blocks_image_path_idx" ON "_articles_v_blocks_image" USING btree ("_path");
  CREATE INDEX "_articles_v_blocks_image_media_idx" ON "_articles_v_blocks_image" USING btree ("media_id");
  CREATE UNIQUE INDEX "_articles_v_blocks_image_locales_locale_parent_id_unique" ON "_articles_v_blocks_image_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_articles_v_blocks_products_order_idx" ON "_articles_v_blocks_products" USING btree ("_order");
  CREATE INDEX "_articles_v_blocks_products_parent_id_idx" ON "_articles_v_blocks_products" USING btree ("_parent_id");
  CREATE INDEX "_articles_v_blocks_products_path_idx" ON "_articles_v_blocks_products" USING btree ("_path");
  CREATE INDEX "business_events_event_type_idx" ON "business_events" USING btree ("event_type");
  CREATE INDEX "business_events_source_idx" ON "business_events" USING btree ("source");
  CREATE INDEX "business_events_actor_idx" ON "business_events" USING btree ("actor_id");
  CREATE UNIQUE INDEX "business_events_external_id_idx" ON "business_events" USING btree ("external_id");
  CREATE INDEX "business_events_external_reference_idx" ON "business_events" USING btree ("external_reference");
  CREATE INDEX "business_events_updated_at_idx" ON "business_events" USING btree ("updated_at");
  CREATE INDEX "business_events_created_at_idx" ON "business_events" USING btree ("created_at");
  CREATE INDEX "business_events_rels_order_idx" ON "business_events_rels" USING btree ("order");
  CREATE INDEX "business_events_rels_parent_idx" ON "business_events_rels" USING btree ("parent_id");
  CREATE INDEX "business_events_rels_path_idx" ON "business_events_rels" USING btree ("path");
  CREATE INDEX "business_events_rels_orders_id_idx" ON "business_events_rels" USING btree ("orders_id");
  CREATE INDEX "business_events_rels_transactions_id_idx" ON "business_events_rels" USING btree ("transactions_id");
  CREATE INDEX "business_events_rels_users_id_idx" ON "business_events_rels" USING btree ("users_id");
  CREATE INDEX "business_events_rels_products_id_idx" ON "business_events_rels" USING btree ("products_id");
  CREATE INDEX "orders_items_order_idx" ON "orders_items" USING btree ("_order");
  CREATE INDEX "orders_items_parent_id_idx" ON "orders_items" USING btree ("_parent_id");
  CREATE INDEX "orders_items_product_idx" ON "orders_items" USING btree ("product_id");
  CREATE INDEX "orders_tenant_idx" ON "orders" USING btree ("tenant_id");
  CREATE INDEX "orders_customer_idx" ON "orders" USING btree ("customer_id");
  CREATE INDEX "orders_user_email_idx" ON "orders" USING btree ("user_email");
  CREATE INDEX "orders_status_idx" ON "orders" USING btree ("status");
  CREATE INDEX "orders_updated_at_idx" ON "orders" USING btree ("updated_at");
  CREATE INDEX "orders_created_at_idx" ON "orders" USING btree ("created_at");
  CREATE INDEX "pages_blocks_image_order_idx" ON "pages_blocks_image" USING btree ("_order");
  CREATE INDEX "pages_blocks_image_parent_id_idx" ON "pages_blocks_image" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_image_path_idx" ON "pages_blocks_image" USING btree ("_path");
  CREATE INDEX "pages_blocks_image_media_idx" ON "pages_blocks_image" USING btree ("media_id");
  CREATE UNIQUE INDEX "pages_blocks_image_locales_locale_parent_id_unique" ON "pages_blocks_image_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_products_order_idx" ON "pages_blocks_products" USING btree ("_order");
  CREATE INDEX "pages_blocks_products_parent_id_idx" ON "pages_blocks_products" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_products_path_idx" ON "pages_blocks_products" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_image_order_idx" ON "_pages_v_blocks_image" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_image_parent_id_idx" ON "_pages_v_blocks_image" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_image_path_idx" ON "_pages_v_blocks_image" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_image_media_idx" ON "_pages_v_blocks_image" USING btree ("media_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_image_locales_locale_parent_id_unique" ON "_pages_v_blocks_image_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_products_order_idx" ON "_pages_v_blocks_products" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_products_parent_id_idx" ON "_pages_v_blocks_products" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_products_path_idx" ON "_pages_v_blocks_products" USING btree ("_path");
  CREATE INDEX "products_gallery_order_idx" ON "products_gallery" USING btree ("_order");
  CREATE INDEX "products_gallery_parent_id_idx" ON "products_gallery" USING btree ("_parent_id");
  CREATE INDEX "products_gallery_media_idx" ON "products_gallery" USING btree ("media_id");
  CREATE UNIQUE INDEX "products_gallery_locales_locale_parent_id_unique" ON "products_gallery_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "products_blocks_content_order_idx" ON "products_blocks_content" USING btree ("_order");
  CREATE INDEX "products_blocks_content_parent_id_idx" ON "products_blocks_content" USING btree ("_parent_id");
  CREATE INDEX "products_blocks_content_path_idx" ON "products_blocks_content" USING btree ("_path");
  CREATE UNIQUE INDEX "products_blocks_content_locales_locale_parent_id_unique" ON "products_blocks_content_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "products_tenant_idx" ON "products" USING btree ("tenant_id");
  CREATE INDEX "products_image_image_media_idx" ON "products" USING btree ("image_media_id");
  CREATE UNIQUE INDEX "products_resource_id_idx" ON "products" USING btree ("resource_id");
  CREATE INDEX "products_updated_at_idx" ON "products" USING btree ("updated_at");
  CREATE INDEX "products_created_at_idx" ON "products" USING btree ("created_at");
  CREATE INDEX "products__status_idx" ON "products" USING btree ("_status");
  CREATE INDEX "products_slug_idx" ON "products_locales" USING btree ("slug","_locale");
  CREATE UNIQUE INDEX "products_locales_locale_parent_id_unique" ON "products_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_products_v_version_gallery_order_idx" ON "_products_v_version_gallery" USING btree ("_order");
  CREATE INDEX "_products_v_version_gallery_parent_id_idx" ON "_products_v_version_gallery" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_gallery_media_idx" ON "_products_v_version_gallery" USING btree ("media_id");
  CREATE UNIQUE INDEX "_products_v_version_gallery_locales_locale_parent_id_unique" ON "_products_v_version_gallery_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_products_v_blocks_content_order_idx" ON "_products_v_blocks_content" USING btree ("_order");
  CREATE INDEX "_products_v_blocks_content_parent_id_idx" ON "_products_v_blocks_content" USING btree ("_parent_id");
  CREATE INDEX "_products_v_blocks_content_path_idx" ON "_products_v_blocks_content" USING btree ("_path");
  CREATE UNIQUE INDEX "_products_v_blocks_content_locales_locale_parent_id_unique" ON "_products_v_blocks_content_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_products_v_parent_idx" ON "_products_v" USING btree ("parent_id");
  CREATE INDEX "_products_v_version_version_tenant_idx" ON "_products_v" USING btree ("version_tenant_id");
  CREATE INDEX "_products_v_version_image_version_image_media_idx" ON "_products_v" USING btree ("version_image_media_id");
  CREATE INDEX "_products_v_version_version_resource_id_idx" ON "_products_v" USING btree ("version_resource_id");
  CREATE INDEX "_products_v_version_version_updated_at_idx" ON "_products_v" USING btree ("version_updated_at");
  CREATE INDEX "_products_v_version_version_created_at_idx" ON "_products_v" USING btree ("version_created_at");
  CREATE INDEX "_products_v_version_version__status_idx" ON "_products_v" USING btree ("version__status");
  CREATE INDEX "_products_v_created_at_idx" ON "_products_v" USING btree ("created_at");
  CREATE INDEX "_products_v_updated_at_idx" ON "_products_v" USING btree ("updated_at");
  CREATE INDEX "_products_v_snapshot_idx" ON "_products_v" USING btree ("snapshot");
  CREATE INDEX "_products_v_published_locale_idx" ON "_products_v" USING btree ("published_locale");
  CREATE INDEX "_products_v_latest_idx" ON "_products_v" USING btree ("latest");
  CREATE INDEX "_products_v_version_version_slug_idx" ON "_products_v_locales" USING btree ("version_slug","_locale");
  CREATE UNIQUE INDEX "_products_v_locales_locale_parent_id_unique" ON "_products_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "shipments_items_order_idx" ON "shipments_items" USING btree ("_order");
  CREATE INDEX "shipments_items_parent_id_idx" ON "shipments_items" USING btree ("_parent_id");
  CREATE INDEX "shipments_items_product_idx" ON "shipments_items" USING btree ("product_id");
  CREATE INDEX "shipments_tenant_idx" ON "shipments" USING btree ("tenant_id");
  CREATE INDEX "shipments_order_idx" ON "shipments" USING btree ("order_id");
  CREATE INDEX "shipments_status_idx" ON "shipments" USING btree ("status");
  CREATE INDEX "shipments_updated_at_idx" ON "shipments" USING btree ("updated_at");
  CREATE INDEX "shipments_created_at_idx" ON "shipments" USING btree ("created_at");
  CREATE INDEX "transactions_tenant_idx" ON "transactions" USING btree ("tenant_id");
  CREATE INDEX "transactions_order_idx" ON "transactions" USING btree ("order_id");
  CREATE INDEX "transactions_customer_idx" ON "transactions" USING btree ("customer_id");
  CREATE UNIQUE INDEX "transactions_payment_reference_idx" ON "transactions" USING btree ("payment_reference");
  CREATE INDEX "transactions_status_idx" ON "transactions" USING btree ("status");
  CREATE INDEX "transactions_payment_method_idx" ON "transactions" USING btree ("payment_method");
  CREATE INDEX "transactions_updated_at_idx" ON "transactions" USING btree ("updated_at");
  CREATE INDEX "transactions_created_at_idx" ON "transactions" USING btree ("created_at");
  CREATE INDEX "users_addresses_order_idx" ON "users_addresses" USING btree ("_order");
  CREATE INDEX "users_addresses_parent_id_idx" ON "users_addresses" USING btree ("_parent_id");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "websites_blocks_internal_link_order_idx" ON "websites_blocks_internal_link" USING btree ("_order");
  CREATE INDEX "websites_blocks_internal_link_parent_id_idx" ON "websites_blocks_internal_link" USING btree ("_parent_id");
  CREATE INDEX "websites_blocks_internal_link_path_idx" ON "websites_blocks_internal_link" USING btree ("_path");
  CREATE INDEX "websites_blocks_internal_link_page_idx" ON "websites_blocks_internal_link" USING btree ("page_id");
  CREATE INDEX "websites_blocks_external_link_order_idx" ON "websites_blocks_external_link" USING btree ("_order");
  CREATE INDEX "websites_blocks_external_link_parent_id_idx" ON "websites_blocks_external_link" USING btree ("_parent_id");
  CREATE INDEX "websites_blocks_external_link_path_idx" ON "websites_blocks_external_link" USING btree ("_path");
  CREATE INDEX "websites_blocks_separator_order_idx" ON "websites_blocks_separator" USING btree ("_order");
  CREATE INDEX "websites_blocks_separator_parent_id_idx" ON "websites_blocks_separator" USING btree ("_parent_id");
  CREATE INDEX "websites_blocks_separator_path_idx" ON "websites_blocks_separator" USING btree ("_path");
  CREATE INDEX "websites_blocks_nav_order_idx" ON "websites_blocks_nav" USING btree ("_order");
  CREATE INDEX "websites_blocks_nav_parent_id_idx" ON "websites_blocks_nav" USING btree ("_parent_id");
  CREATE INDEX "websites_blocks_nav_path_idx" ON "websites_blocks_nav" USING btree ("_path");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  ALTER TABLE "articles_rels" ADD CONSTRAINT "articles_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_rels" ADD CONSTRAINT "_articles_v_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "happenings_blocks_session_schedule_contributors_locales" ADD CONSTRAINT "happenings_blocks_session_schedule_contributors_locales_p_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."happenings_blocks_session_schedule_contributors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "websites" ADD CONSTRAINT "websites_publisher_id_organizations_id_fk" FOREIGN KEY ("publisher_id") REFERENCES "public"."organizations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_business_events_fk" FOREIGN KEY ("business_events_id") REFERENCES "public"."business_events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_orders_fk" FOREIGN KEY ("orders_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_shipments_fk" FOREIGN KEY ("shipments_id") REFERENCES "public"."shipments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_transactions_fk" FOREIGN KEY ("transactions_id") REFERENCES "public"."transactions"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "articles_rels_products_id_idx" ON "articles_rels" USING btree ("products_id");
  CREATE UNIQUE INDEX "_articles_v_version_contributors_locales_locale_parent_id_un" ON "_articles_v_version_contributors_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_articles_v_rels_products_id_idx" ON "_articles_v_rels" USING btree ("products_id");
  CREATE UNIQUE INDEX "happenings_blocks_session_schedule_contributors_locales_loca" ON "happenings_blocks_session_schedule_contributors_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "happenings_blocks_session_schedule_locales_locale_parent_id_" ON "happenings_blocks_session_schedule_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_rels_products_id_idx" ON "pages_rels" USING btree ("products_id");
  CREATE UNIQUE INDEX "_pages_v_version_contributors_locales_locale_parent_id_uniqu" ON "_pages_v_version_contributors_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_rels_products_id_idx" ON "_pages_v_rels" USING btree ("products_id");
  CREATE INDEX "websites_publisher_idx" ON "websites" USING btree ("publisher_id");
  CREATE INDEX "websites_texts_order_parent" ON "websites_texts" USING btree ("order","parent_id");
  CREATE INDEX "payload_locked_documents_rels_business_events_id_idx" ON "payload_locked_documents_rels" USING btree ("business_events_id");
  CREATE INDEX "payload_locked_documents_rels_orders_id_idx" ON "payload_locked_documents_rels" USING btree ("orders_id");
  CREATE INDEX "payload_locked_documents_rels_products_id_idx" ON "payload_locked_documents_rels" USING btree ("products_id");
  CREATE INDEX "payload_locked_documents_rels_shipments_id_idx" ON "payload_locked_documents_rels" USING btree ("shipments_id");
  CREATE INDEX "payload_locked_documents_rels_transactions_id_idx" ON "payload_locked_documents_rels" USING btree ("transactions_id");
  CREATE UNIQUE INDEX "redirects_from_idx" ON "redirects" USING btree ("from");
  ALTER TABLE "places" DROP COLUMN "tenant_id";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "articles_blocks_image" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "articles_blocks_image_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "articles_blocks_products" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_articles_v_blocks_image" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_articles_v_blocks_image_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_articles_v_blocks_products" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "business_events" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "business_events_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "orders_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "orders" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_image" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_image_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_products" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_image" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_image_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_products" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "products_gallery" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "products_gallery_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "products_blocks_content" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "products_blocks_content_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "products" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "products_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_products_v_version_gallery" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_products_v_version_gallery_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_products_v_blocks_content" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_products_v_blocks_content_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_products_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_products_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "shipments_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "shipments" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "transactions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "users_addresses" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "users_sessions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "websites_blocks_internal_link" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "websites_blocks_external_link" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "websites_blocks_separator" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "websites_blocks_nav" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload_kv" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "articles_blocks_image" CASCADE;
  DROP TABLE "articles_blocks_image_locales" CASCADE;
  DROP TABLE "articles_blocks_products" CASCADE;
  DROP TABLE "_articles_v_blocks_image" CASCADE;
  DROP TABLE "_articles_v_blocks_image_locales" CASCADE;
  DROP TABLE "_articles_v_blocks_products" CASCADE;
  DROP TABLE "business_events" CASCADE;
  DROP TABLE "business_events_rels" CASCADE;
  DROP TABLE "orders_items" CASCADE;
  DROP TABLE "orders" CASCADE;
  DROP TABLE "pages_blocks_image" CASCADE;
  DROP TABLE "pages_blocks_image_locales" CASCADE;
  DROP TABLE "pages_blocks_products" CASCADE;
  DROP TABLE "_pages_v_blocks_image" CASCADE;
  DROP TABLE "_pages_v_blocks_image_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_products" CASCADE;
  DROP TABLE "products_gallery" CASCADE;
  DROP TABLE "products_gallery_locales" CASCADE;
  DROP TABLE "products_blocks_content" CASCADE;
  DROP TABLE "products_blocks_content_locales" CASCADE;
  DROP TABLE "products" CASCADE;
  DROP TABLE "products_locales" CASCADE;
  DROP TABLE "_products_v_version_gallery" CASCADE;
  DROP TABLE "_products_v_version_gallery_locales" CASCADE;
  DROP TABLE "_products_v_blocks_content" CASCADE;
  DROP TABLE "_products_v_blocks_content_locales" CASCADE;
  DROP TABLE "_products_v" CASCADE;
  DROP TABLE "_products_v_locales" CASCADE;
  DROP TABLE "shipments_items" CASCADE;
  DROP TABLE "shipments" CASCADE;
  DROP TABLE "transactions" CASCADE;
  DROP TABLE "users_addresses" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "websites_blocks_internal_link" CASCADE;
  DROP TABLE "websites_blocks_external_link" CASCADE;
  DROP TABLE "websites_blocks_separator" CASCADE;
  DROP TABLE "websites_blocks_nav" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  ALTER TABLE "articles_rels" DROP CONSTRAINT "articles_rels_products_fk";
  
  ALTER TABLE "_articles_v_rels" DROP CONSTRAINT "_articles_v_rels_products_fk";
  
  ALTER TABLE "happenings_blocks_session_schedule_contributors_locales" DROP CONSTRAINT "happenings_blocks_session_schedule_contributors_locales_p_fk";
  
  ALTER TABLE "pages_rels" DROP CONSTRAINT "pages_rels_products_fk";
  
  ALTER TABLE "_pages_v_rels" DROP CONSTRAINT "_pages_v_rels_products_fk";
  
  ALTER TABLE "websites" DROP CONSTRAINT "websites_publisher_id_organizations_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_business_events_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_orders_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_products_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_shipments_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_transactions_fk";
  
  DROP INDEX "articles_rels_products_id_idx";
  DROP INDEX "_articles_v_version_contributors_locales_locale_parent_id_un";
  DROP INDEX "_articles_v_rels_products_id_idx";
  DROP INDEX "happenings_blocks_session_schedule_contributors_locales_loca";
  DROP INDEX "happenings_blocks_session_schedule_locales_locale_parent_id_";
  DROP INDEX "pages_rels_products_id_idx";
  DROP INDEX "_pages_v_version_contributors_locales_locale_parent_id_uniqu";
  DROP INDEX "_pages_v_rels_products_id_idx";
  DROP INDEX "websites_publisher_idx";
  DROP INDEX "websites_texts_order_parent";
  DROP INDEX "payload_locked_documents_rels_business_events_id_idx";
  DROP INDEX "payload_locked_documents_rels_orders_id_idx";
  DROP INDEX "payload_locked_documents_rels_products_id_idx";
  DROP INDEX "payload_locked_documents_rels_shipments_id_idx";
  DROP INDEX "payload_locked_documents_rels_transactions_id_idx";
  DROP INDEX "redirects_from_idx";
  ALTER TABLE "forms_emails_locales" ALTER COLUMN "subject" SET DEFAULT 'You''''ve received a new message.';
  ALTER TABLE "places" ADD COLUMN "tenant_id" uuid;
  ALTER TABLE "happenings_blocks_session_schedule_contributors_locales" ADD CONSTRAINT "happenings_blocks_session_schedule_contributors_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."happenings_blocks_session_schedule_contributors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "places" ADD CONSTRAINT "places_tenant_id_websites_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."websites"("id") ON DELETE set null ON UPDATE no action;
  CREATE UNIQUE INDEX "_articles_v_version_contributors_locales_locale_parent_id_unique" ON "_articles_v_version_contributors_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "happenings_blocks_session_schedule_contributors_locales_locale_parent_id_unique" ON "happenings_blocks_session_schedule_contributors_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "happenings_blocks_session_schedule_locales_locale_parent_id_unique" ON "happenings_blocks_session_schedule_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "_pages_v_version_contributors_locales_locale_parent_id_unique" ON "_pages_v_version_contributors_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "places_tenant_idx" ON "places" USING btree ("tenant_id");
  CREATE INDEX "websites_texts_order_parent_idx" ON "websites_texts" USING btree ("order","parent_id");
  CREATE INDEX "redirects_from_idx" ON "redirects" USING btree ("from");
  ALTER TABLE "articles_rels" DROP COLUMN "products_id";
  ALTER TABLE "_articles_v_rels" DROP COLUMN "products_id";
  ALTER TABLE "organizations" DROP COLUMN "organization_number";
  ALTER TABLE "organizations" DROP COLUMN "url";
  ALTER TABLE "organizations" DROP COLUMN "email";
  ALTER TABLE "organizations" DROP COLUMN "phone";
  ALTER TABLE "organizations" DROP COLUMN "address_address_line1";
  ALTER TABLE "organizations" DROP COLUMN "address_address_line2";
  ALTER TABLE "organizations" DROP COLUMN "address_postal_code";
  ALTER TABLE "organizations" DROP COLUMN "address_city";
  ALTER TABLE "organizations" DROP COLUMN "address_country";
  ALTER TABLE "pages_rels" DROP COLUMN "products_id";
  ALTER TABLE "_pages_v_rels" DROP COLUMN "products_id";
  ALTER TABLE "websites" DROP COLUMN "publisher_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "business_events_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "orders_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "products_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "shipments_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "transactions_id";
  DROP TYPE "public"."enum_orders_status";
  DROP TYPE "public"."enum_products_product_type";
  DROP TYPE "public"."enum_products_price_currency";
  DROP TYPE "public"."enum_products_status";
  DROP TYPE "public"."enum__products_v_version_product_type";
  DROP TYPE "public"."enum__products_v_version_price_currency";
  DROP TYPE "public"."enum__products_v_version_status";
  DROP TYPE "public"."enum__products_v_published_locale";
  DROP TYPE "public"."enum_shipments_status";
  DROP TYPE "public"."enum_shipments_shipment_type";
  DROP TYPE "public"."enum_transactions_currency";
  DROP TYPE "public"."enum_websites_blocks_separator_style";`)
}
