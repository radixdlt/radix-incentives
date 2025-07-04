DROP INDEX IF EXISTS "idx_account_balances_conflict";--> statement-breakpoint
ALTER TABLE "user_season_points" ALTER COLUMN "points" SET DATA TYPE numeric(18, 6);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_account_balances_timestamp" ON "account_balances" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_account_balances_account" ON "account_balances" USING btree ("account_address");