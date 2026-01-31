-- Rename express_sessions table to sessions (framework-agnostic naming)
ALTER TABLE "idem"."express_sessions" RENAME TO "sessions";
--> statement-breakpoint
-- Rename index to match new table name
ALTER INDEX "idem"."idx_express_sessions_expire" RENAME TO "idx_sessions_expire";
