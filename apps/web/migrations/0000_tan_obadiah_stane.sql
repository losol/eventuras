CREATE TABLE "authUser" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"provider_name" text NOT NULL,
	"provider_user_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_authUser_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."authUser"("id") ON DELETE no action ON UPDATE no action;