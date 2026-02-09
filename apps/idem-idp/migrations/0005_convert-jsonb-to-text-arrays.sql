-- Convert JSONB array columns to TEXT[] for oauth_clients table
-- TEXT[] is more appropriate for simple string arrays and supports native PG array operators

-- Convert redirect_uris from JSONB to TEXT[]
ALTER TABLE "idem"."oauth_clients"
ALTER COLUMN "redirect_uris" TYPE text[]
USING (SELECT array_agg(value::text) FROM jsonb_array_elements_text("redirect_uris"));
--> statement-breakpoint

-- Convert grant_types from JSONB to TEXT[]
ALTER TABLE "idem"."oauth_clients"
ALTER COLUMN "grant_types" TYPE text[]
USING (SELECT array_agg(value::text) FROM jsonb_array_elements_text("grant_types"));
--> statement-breakpoint

-- Convert response_types from JSONB to TEXT[]
ALTER TABLE "idem"."oauth_clients"
ALTER COLUMN "response_types" TYPE text[]
USING (SELECT array_agg(value::text) FROM jsonb_array_elements_text("response_types"));
--> statement-breakpoint

-- Convert allowed_scopes from JSONB to TEXT[]
ALTER TABLE "idem"."oauth_clients"
ALTER COLUMN "allowed_scopes" TYPE text[]
USING (SELECT array_agg(value::text) FROM jsonb_array_elements_text("allowed_scopes"));
--> statement-breakpoint

-- Convert default_scopes from JSONB to TEXT[]
ALTER TABLE "idem"."oauth_clients"
ALTER COLUMN "default_scopes" TYPE text[]
USING (SELECT array_agg(value::text) FROM jsonb_array_elements_text("default_scopes"));
--> statement-breakpoint

-- Convert contacts from JSONB to TEXT[] (nullable)
ALTER TABLE "idem"."oauth_clients"
ALTER COLUMN "contacts" TYPE text[]
USING (SELECT array_agg(value::text) FROM jsonb_array_elements_text("contacts"));
