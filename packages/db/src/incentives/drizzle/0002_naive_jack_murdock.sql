CREATE TABLE IF NOT EXISTS "consultation" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"consultation_id" text NOT NULL,
	"account_address" varchar(255) NOT NULL,
	"selected_option" text NOT NULL,
	"rola_proof" jsonb,
	"timestamp" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "consultation" ADD CONSTRAINT "consultation_account_address_account_address_fk" FOREIGN KEY ("account_address") REFERENCES "public"."account"("address") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "consultation_vote_uidx" ON "consultation" USING btree ("consultation_id","account_address");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "consultation_id_idx" ON "consultation" USING btree ("consultation_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "account_address_idx" ON "consultation" USING btree ("account_address");