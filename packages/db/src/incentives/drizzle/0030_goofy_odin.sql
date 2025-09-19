ALTER TABLE "user" ADD COLUMN "referral_code" varchar(6);--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "referred_by" uuid;--> statement-breakpoint
ALTER TABLE "user_season_points" ADD COLUMN "referral_points" numeric(18, 6);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "referred_by_idx" ON "user" USING btree ("referred_by");--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_referral_code_unique" UNIQUE("referral_code");