-- ADR 0018: Per-Client Role-Based Access Control
-- This migration adds the RBAC tables for per-client role assignments

-- Create client_roles table (defines roles available per OAuth client)
CREATE TABLE "idem"."client_roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"oauth_client_id" uuid NOT NULL REFERENCES "idem"."oauth_clients"("id") ON DELETE CASCADE,
	"role_name" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "idx_client_roles_unique" UNIQUE("oauth_client_id", "role_name")
);
--> statement-breakpoint
CREATE INDEX "idx_client_roles_client" ON "idem"."client_roles" ("oauth_client_id");
--> statement-breakpoint

-- Create role_grants table (maps users to roles for specific clients)
CREATE TABLE "idem"."role_grants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" uuid NOT NULL REFERENCES "idem"."accounts"("id") ON DELETE CASCADE,
	"client_role_id" uuid NOT NULL REFERENCES "idem"."client_roles"("id") ON DELETE CASCADE,
	"granted_at" timestamp DEFAULT now() NOT NULL,
	"granted_by" uuid REFERENCES "idem"."accounts"("id") ON DELETE SET NULL,
	CONSTRAINT "idx_role_grants_unique" UNIQUE("account_id", "client_role_id")
);
--> statement-breakpoint
CREATE INDEX "idx_role_grants_account" ON "idem"."role_grants" ("account_id");
--> statement-breakpoint

-- Seed idem-admin client with predefined roles
-- NOTE: The ON CONFLICT clause handles re-running the migration safely

-- First, insert the idem-admin client if it doesn't exist
-- NOTE: client_secret_hash is NULL - must be set up separately via admin tools
-- NOTE: redirect_uris only contains localhost defaults - production URLs are
--       added by the application on startup from IDEM_ADMIN_URL env var
INSERT INTO "idem"."oauth_clients" (
	"client_id",
	"client_name",
	"client_type",
	"client_secret_hash",
	"redirect_uris",
	"grant_types",
	"response_types",
	"allowed_scopes",
	"default_scopes",
	"require_pkce",
	"active"
) VALUES (
	'idem-admin',
	'Idem Admin Console',
	'confidential',
	NULL,
	'["http://localhost:3200/admin/callback", "http://localhost:3201/callback"]',
	'["authorization_code", "refresh_token"]',
	'["code"]',
	'["openid", "profile", "email", "offline_access"]',
	'["openid", "profile", "email"]',
	true,
	true
) ON CONFLICT ("client_id") DO NOTHING;
--> statement-breakpoint

-- Create systemadmin role for idem-admin
INSERT INTO "idem"."client_roles" ("oauth_client_id", "role_name", "description")
SELECT "id", 'systemadmin', 'Full administrative access to Idem'
FROM "idem"."oauth_clients"
WHERE "client_id" = 'idem-admin'
ON CONFLICT ("oauth_client_id", "role_name") DO NOTHING;
--> statement-breakpoint

-- Create admin_reader role for idem-admin
INSERT INTO "idem"."client_roles" ("oauth_client_id", "role_name", "description")
SELECT "id", 'admin_reader', 'Read-only access to Idem admin panel'
FROM "idem"."oauth_clients"
WHERE "client_id" = 'idem-admin'
ON CONFLICT ("oauth_client_id", "role_name") DO NOTHING;
--> statement-breakpoint

-- Migrate existing systemRole data to role_grants
-- Users with system_role = 'system_admin' get systemadmin role for idem-admin
INSERT INTO "idem"."role_grants" ("account_id", "client_role_id")
SELECT a."id", cr."id"
FROM "idem"."accounts" a
CROSS JOIN "idem"."client_roles" cr
INNER JOIN "idem"."oauth_clients" oc ON cr."oauth_client_id" = oc."id"
WHERE a."system_role" = 'system_admin'
  AND oc."client_id" = 'idem-admin'
  AND cr."role_name" = 'systemadmin'
ON CONFLICT ("account_id", "client_role_id") DO NOTHING;
--> statement-breakpoint

-- Users with system_role = 'admin_reader' get admin_reader role for idem-admin
INSERT INTO "idem"."role_grants" ("account_id", "client_role_id")
SELECT a."id", cr."id"
FROM "idem"."accounts" a
CROSS JOIN "idem"."client_roles" cr
INNER JOIN "idem"."oauth_clients" oc ON cr."oauth_client_id" = oc."id"
WHERE a."system_role" = 'admin_reader'
  AND oc."client_id" = 'idem-admin'
  AND cr."role_name" = 'admin_reader'
ON CONFLICT ("account_id", "client_role_id") DO NOTHING;
