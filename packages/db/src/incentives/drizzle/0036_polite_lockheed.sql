DO $$ BEGIN
 CREATE TYPE "public"."account_recovery_request_status" AS ENUM('pending', 'completed', 'failed');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "account_recovery_proof" (
	"recovery_request_id" uuid NOT NULL,
	"account_address" varchar(255) NOT NULL,
	"verified_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "account_recovery_proof_recovery_request_id_account_address_pk" PRIMARY KEY("recovery_request_id","account_address")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "account_recovery_request" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"requester_user_id" uuid NOT NULL,
	"status" "account_recovery_request_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "account_recovery_proof" ADD CONSTRAINT "account_recovery_proof_recovery_request_id_account_recovery_request_id_fk" FOREIGN KEY ("recovery_request_id") REFERENCES "public"."account_recovery_request"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "account_recovery_proof" ADD CONSTRAINT "account_recovery_proof_account_address_account_address_fk" FOREIGN KEY ("account_address") REFERENCES "public"."account"("address") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "account_recovery_request" ADD CONSTRAINT "account_recovery_request_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "account_recovery_request" ADD CONSTRAINT "account_recovery_request_requester_user_id_user_id_fk" FOREIGN KEY ("requester_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
