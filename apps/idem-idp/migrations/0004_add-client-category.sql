-- Add client_category column to oauth_clients table
-- 'internal' = first-party apps (no consent required)
-- 'external' = third-party apps (consent required)

ALTER TABLE "idem"."oauth_clients"
ADD COLUMN "client_category" text NOT NULL DEFAULT 'internal';
--> statement-breakpoint

-- Add constraint to ensure valid values
ALTER TABLE "idem"."oauth_clients"
ADD CONSTRAINT "valid_client_category" CHECK (client_category IN ('internal', 'external'));
