CREATE SCHEMA "idem";
--> statement-breakpoint
CREATE TABLE "idem"."accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"primary_email" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"given_name" text,
	"middle_name" text,
	"family_name" text,
	"display_name" text NOT NULL,
	"phone" text,
	"birthdate" date,
	"locale" text DEFAULT 'nb-NO',
	"timezone" text DEFAULT 'Europe/Oslo',
	"picture" text,
	"system_role" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "idx_accounts_primary_email" UNIQUE("primary_email"),
	CONSTRAINT "valid_system_role" CHECK (system_role IS NULL OR system_role IN ('system_admin', 'admin_reader'))
);
--> statement-breakpoint
CREATE TABLE "idem"."emails" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" uuid NOT NULL,
	"email" text NOT NULL,
	"verified" boolean DEFAULT false NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"verification_token" text,
	"verification_token_expires_at" timestamp,
	"verified_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "idx_emails_email" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "idem"."identities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" uuid NOT NULL,
	"provider" text NOT NULL,
	"provider_subject" text NOT NULL,
	"provider_issuer" text,
	"is_primary" boolean DEFAULT false NOT NULL,
	"email_verified" boolean DEFAULT false,
	"phone_verified" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"last_used_at" timestamp,
	CONSTRAINT "idx_identities_provider_subject" UNIQUE("provider","provider_subject")
);
--> statement-breakpoint
CREATE TABLE "idem"."account_claims" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" uuid NOT NULL,
	"claim_type" text NOT NULL,
	"claim_value" jsonb NOT NULL,
	"source_provider" text NOT NULL,
	"source_verified_at" timestamp,
	"raw_claims" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "idem"."otp_codes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"recipient" text NOT NULL,
	"recipient_type" text NOT NULL,
	"code_hash" text NOT NULL,
	"account_id" uuid,
	"attempts" integer DEFAULT 0 NOT NULL,
	"max_attempts" integer DEFAULT 5 NOT NULL,
	"consumed" boolean DEFAULT false NOT NULL,
	"expires_at" timestamp NOT NULL,
	"session_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"consumed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "idem"."otp_rate_limits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"recipient" text NOT NULL,
	"recipient_type" text NOT NULL,
	"request_count" integer DEFAULT 1 NOT NULL,
	"window_start" timestamp DEFAULT now() NOT NULL,
	"window_end" timestamp NOT NULL,
	"blocked" boolean DEFAULT false NOT NULL,
	"blocked_until" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "idx_otp_ratelimit_recipient" UNIQUE("recipient","recipient_type")
);
--> statement-breakpoint
CREATE TABLE "idem"."jwks_keys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kid" text NOT NULL,
	"use" text NOT NULL,
	"alg" text NOT NULL,
	"kty" text NOT NULL,
	"public_key" jsonb NOT NULL,
	"private_key_encrypted" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"primary" boolean DEFAULT false NOT NULL,
	"rotated_at" timestamp,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "jwks_keys_kid_unique" UNIQUE("kid")
);
--> statement-breakpoint
CREATE TABLE "idem"."oauth_clients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" text NOT NULL,
	"client_name" text NOT NULL,
	"client_secret_hash" text,
	"client_type" text NOT NULL,
	"redirect_uris" jsonb NOT NULL,
	"grant_types" jsonb NOT NULL,
	"response_types" jsonb NOT NULL,
	"allowed_scopes" jsonb NOT NULL,
	"default_scopes" jsonb NOT NULL,
	"require_pkce" boolean DEFAULT true NOT NULL,
	"access_token_lifetime" integer DEFAULT 3600 NOT NULL,
	"refresh_token_lifetime" integer DEFAULT 2592000 NOT NULL,
	"id_token_lifetime" integer DEFAULT 3600 NOT NULL,
	"logo_uri" text,
	"client_uri" text,
	"policy_uri" text,
	"tos_uri" text,
	"contacts" jsonb,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "oauth_clients_client_id_unique" UNIQUE("client_id")
);
--> statement-breakpoint
CREATE TABLE "idem"."idp_providers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider_key" text NOT NULL,
	"provider_name" text NOT NULL,
	"provider_type" text NOT NULL,
	"issuer" text,
	"authorization_endpoint" text,
	"token_endpoint" text,
	"userinfo_endpoint" text,
	"jwks_uri" text,
	"display_name" text NOT NULL,
	"logo_url" text,
	"button_color" text,
	"client_id" text,
	"client_secret_encrypted" text,
	"scopes" jsonb,
	"redirect_uri" text,
	"additional_params" jsonb,
	"consecutive_failures" integer DEFAULT 0 NOT NULL,
	"last_failure_at" timestamp,
	"last_success_at" timestamp,
	"enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "idp_providers_provider_key_unique" UNIQUE("provider_key")
);
--> statement-breakpoint
CREATE TABLE "idem"."idp_states" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"state" text NOT NULL,
	"code_verifier" text,
	"nonce" text,
	"provider_id" uuid NOT NULL,
	"return_to" text,
	"session_id" text,
	"ip_address" text,
	"user_agent" text,
	"consumed" boolean DEFAULT false NOT NULL,
	"consumed_at" timestamp,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "idp_states_state_unique" UNIQUE("state")
);
--> statement-breakpoint
CREATE TABLE "idem"."used_id_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"jti" text NOT NULL,
	"provider_id" uuid NOT NULL,
	"subject" text NOT NULL,
	"issued_at" timestamp NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "idx_used_id_tokens_jti_provider" UNIQUE("jti","provider_id")
);
--> statement-breakpoint
CREATE TABLE "idem"."express_sessions" (
	"sid" text PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "idem"."oidc_store" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"oidc_id" text NOT NULL,
	"account_id" uuid,
	"client_id" text,
	"grant_id" text,
	"session_id" text,
	"scope" text,
	"uid" text,
	"payload" jsonb NOT NULL,
	"expires_at" timestamp NOT NULL,
	"consumed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "idem"."session_fingerprints" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" text NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_agent_hash" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_seen_at" timestamp DEFAULT now() NOT NULL,
	"violation_count" integer DEFAULT 0 NOT NULL,
	"last_violation_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "idem"."audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_type" text NOT NULL,
	"event_category" text NOT NULL,
	"actor_type" text NOT NULL,
	"actor_id" uuid,
	"actor_name" text,
	"target_type" text,
	"target_id" text,
	"target_name" text,
	"ip_address" text,
	"user_agent" text,
	"session_id" text,
	"success" text NOT NULL,
	"error_code" text,
	"error_message" text,
	"metadata" jsonb,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "idem"."cleanup_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cleanup_type" text NOT NULL,
	"status" text NOT NULL,
	"items_processed" integer DEFAULT 0 NOT NULL,
	"items_deleted" integer DEFAULT 0 NOT NULL,
	"items_failed" integer DEFAULT 0 NOT NULL,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	"duration_ms" integer,
	"error_message" text,
	"error_stack" text,
	"metadata" jsonb
);
--> statement-breakpoint
CREATE TABLE "idem"."system_health" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"check_type" text NOT NULL,
	"status" text NOT NULL,
	"value" text,
	"threshold" text,
	"message" text,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "idem"."emails" ADD CONSTRAINT "emails_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "idem"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "idem"."identities" ADD CONSTRAINT "identities_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "idem"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "idem"."account_claims" ADD CONSTRAINT "account_claims_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "idem"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "idem"."otp_codes" ADD CONSTRAINT "otp_codes_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "idem"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "idem"."idp_states" ADD CONSTRAINT "idp_states_provider_id_idp_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "idem"."idp_providers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "idem"."used_id_tokens" ADD CONSTRAINT "used_id_tokens_provider_id_idp_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "idem"."idp_providers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "idem"."oidc_store" ADD CONSTRAINT "oidc_store_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "idem"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "idem"."audit_log" ADD CONSTRAINT "audit_log_actor_id_accounts_id_fk" FOREIGN KEY ("actor_id") REFERENCES "idem"."accounts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_accounts_active" ON "idem"."accounts" USING btree ("active");--> statement-breakpoint
CREATE INDEX "idx_emails_account" ON "idem"."emails" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX "idx_emails_verified" ON "idem"."emails" USING btree ("verified");--> statement-breakpoint
CREATE INDEX "idx_identities_account" ON "idem"."identities" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX "idx_identities_primary" ON "idem"."identities" USING btree ("account_id","is_primary");--> statement-breakpoint
CREATE INDEX "idx_account_claims_account" ON "idem"."account_claims" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX "idx_account_claims_type" ON "idem"."account_claims" USING btree ("claim_type");--> statement-breakpoint
CREATE INDEX "idx_account_claims_provider" ON "idem"."account_claims" USING btree ("source_provider");--> statement-breakpoint
CREATE INDEX "idx_otp_recipient" ON "idem"."otp_codes" USING btree ("recipient","recipient_type");--> statement-breakpoint
CREATE INDEX "idx_otp_expires" ON "idem"."otp_codes" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "idx_otp_consumed" ON "idem"."otp_codes" USING btree ("consumed");--> statement-breakpoint
CREATE INDEX "idx_otp_session" ON "idem"."otp_codes" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "idx_otp_ratelimit_window" ON "idem"."otp_rate_limits" USING btree ("window_end");--> statement-breakpoint
CREATE INDEX "idx_otp_ratelimit_blocked" ON "idem"."otp_rate_limits" USING btree ("blocked","blocked_until");--> statement-breakpoint
CREATE INDEX "idx_jwks_keys_active" ON "idem"."jwks_keys" USING btree ("active");--> statement-breakpoint
CREATE INDEX "idx_jwks_keys_primary" ON "idem"."jwks_keys" USING btree ("primary");--> statement-breakpoint
CREATE INDEX "idx_jwks_keys_expires" ON "idem"."jwks_keys" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "idx_oauth_clients_active" ON "idem"."oauth_clients" USING btree ("active");--> statement-breakpoint
CREATE INDEX "idx_idp_providers_enabled" ON "idem"."idp_providers" USING btree ("enabled");--> statement-breakpoint
CREATE INDEX "idx_idp_states_provider" ON "idem"."idp_states" USING btree ("provider_id");--> statement-breakpoint
CREATE INDEX "idx_idp_states_expires" ON "idem"."idp_states" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "idx_idp_states_consumed" ON "idem"."idp_states" USING btree ("consumed");--> statement-breakpoint
CREATE INDEX "idx_used_id_tokens_expires" ON "idem"."used_id_tokens" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "idx_express_sessions_expire" ON "idem"."express_sessions" USING btree ("expire");--> statement-breakpoint
CREATE INDEX "idx_oidc_store_name_oidc_id" ON "idem"."oidc_store" USING btree ("name","oidc_id");--> statement-breakpoint
CREATE INDEX "idx_oidc_store_grant" ON "idem"."oidc_store" USING btree ("grant_id");--> statement-breakpoint
CREATE INDEX "idx_oidc_store_session" ON "idem"."oidc_store" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "idx_oidc_store_uid" ON "idem"."oidc_store" USING btree ("uid");--> statement-breakpoint
CREATE INDEX "idx_oidc_store_expires" ON "idem"."oidc_store" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "idx_oidc_store_account" ON "idem"."oidc_store" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX "idx_session_fingerprints_session" ON "idem"."session_fingerprints" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "idx_session_fingerprints_ip" ON "idem"."session_fingerprints" USING btree ("ip_address");--> statement-breakpoint
CREATE INDEX "idx_audit_log_event_type" ON "idem"."audit_log" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "idx_audit_log_event_category" ON "idem"."audit_log" USING btree ("event_category");--> statement-breakpoint
CREATE INDEX "idx_audit_log_actor" ON "idem"."audit_log" USING btree ("actor_id");--> statement-breakpoint
CREATE INDEX "idx_audit_log_target" ON "idem"."audit_log" USING btree ("target_type","target_id");--> statement-breakpoint
CREATE INDEX "idx_audit_log_timestamp" ON "idem"."audit_log" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "idx_audit_log_ip" ON "idem"."audit_log" USING btree ("ip_address");--> statement-breakpoint
CREATE INDEX "idx_cleanup_runs_type" ON "idem"."cleanup_runs" USING btree ("cleanup_type");--> statement-breakpoint
CREATE INDEX "idx_cleanup_runs_status" ON "idem"."cleanup_runs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_cleanup_runs_started" ON "idem"."cleanup_runs" USING btree ("started_at");--> statement-breakpoint
CREATE INDEX "idx_system_health_type" ON "idem"."system_health" USING btree ("check_type");--> statement-breakpoint
CREATE INDEX "idx_system_health_status" ON "idem"."system_health" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_system_health_timestamp" ON "idem"."system_health" USING btree ("timestamp");