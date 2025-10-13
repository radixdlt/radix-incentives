CREATE TABLE IF NOT EXISTS "resource_reward_claim" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"resource_manager" varchar(255) NOT NULL,
	"local_id" varchar(255),
	"user_id" uuid NOT NULL,
	"week_id" uuid NOT NULL,
	"season_id" uuid NOT NULL,
	"claimed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "resource_reward_definition" (
	"address" varchar(255) PRIMARY KEY NOT NULL,
	"points" integer NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "resource_reward_claim" ADD CONSTRAINT "resource_reward_claim_resource_manager_resource_reward_definition_address_fk" FOREIGN KEY ("resource_manager") REFERENCES "public"."resource_reward_definition"("address") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "resource_reward_claim" ADD CONSTRAINT "resource_reward_claim_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "resource_reward_claim" ADD CONSTRAINT "resource_reward_claim_week_id_week_id_fk" FOREIGN KEY ("week_id") REFERENCES "public"."week"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "resource_reward_claim" ADD CONSTRAINT "resource_reward_claim_season_id_season_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."season"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_resource_claims_week_id" ON "resource_reward_claim" USING btree ("week_id");