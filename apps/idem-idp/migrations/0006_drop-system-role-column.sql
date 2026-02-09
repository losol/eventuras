-- Remove system_role column from accounts table
-- This column is replaced by the per-client RBAC system (ADR 0018)
-- Data has already been migrated to role_grants table in migration 0003

-- Drop the CHECK constraint first
ALTER TABLE "idem"."accounts"
DROP CONSTRAINT IF EXISTS "valid_system_role";
--> statement-breakpoint

-- Drop the system_role column
ALTER TABLE "idem"."accounts"
DROP COLUMN IF EXISTS "system_role";
