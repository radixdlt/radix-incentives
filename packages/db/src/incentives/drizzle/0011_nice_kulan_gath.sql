TRUNCATE TABLE "activity" CASCADE;

CREATE TABLE IF NOT EXISTS "activity_categories" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text
);
--> statement-breakpoint
ALTER TABLE "account_balances" DROP CONSTRAINT "account_balances_activity_id_activity_id_fk";
--> statement-breakpoint
ALTER TABLE "event" DROP CONSTRAINT "event_activity_id_activity_id_fk";
--> statement-breakpoint
DROP INDEX IF EXISTS "idx_account_balances_conflict";--> statement-breakpoint
ALTER TABLE "account_balances" DROP CONSTRAINT "account_balances_account_address_timestamp_activity_id_pk";--> statement-breakpoint
ALTER TABLE "activity" ALTER COLUMN "name" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "activity" ALTER COLUMN "name" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "activity" ALTER COLUMN "category" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "challenge" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "account_balances" ADD CONSTRAINT "account_balances_account_address_timestamp_pk" PRIMARY KEY("account_address","timestamp");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "activity" ADD CONSTRAINT "activity_category_activity_categories_id_fk" FOREIGN KEY ("category") REFERENCES "public"."activity_categories"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_account_balances_conflict" ON "account_balances" USING btree ("account_address","timestamp");--> statement-breakpoint
ALTER TABLE "account_balances" DROP COLUMN IF EXISTS "usd_value";--> statement-breakpoint
ALTER TABLE "account_balances" DROP COLUMN IF EXISTS "activity_id";--> statement-breakpoint
ALTER TABLE "activity" DROP COLUMN IF EXISTS "type";--> statement-breakpoint
ALTER TABLE "activity" DROP COLUMN IF EXISTS "reward_type";--> statement-breakpoint
ALTER TABLE "activity" DROP COLUMN IF EXISTS "rules";--> statement-breakpoint
ALTER TABLE "event" DROP COLUMN IF EXISTS "activity_id";