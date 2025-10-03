DROP INDEX IF EXISTS "idx_season_leaderboard_rank";--> statement-breakpoint
ALTER TABLE "season_leaderboard_cache" DROP CONSTRAINT "season_leaderboard_cache_season_id_user_id_pk";--> statement-breakpoint
ALTER TABLE "season_leaderboard_cache" ADD COLUMN "week_id" uuid DEFAULT '00000000-0000-0000-0000-000000000000' NOT NULL;--> statement-breakpoint
ALTER TABLE "season_leaderboard_cache" ADD COLUMN "total_referral_points" numeric(18, 6);--> statement-breakpoint
ALTER TABLE "season_leaderboard_cache" ADD COLUMN "category_breakdown" jsonb NOT NULL DEFAULT '{}'::jsonb;--> statement-breakpoint
ALTER TABLE "season_leaderboard_cache" ADD CONSTRAINT "season_leaderboard_cache_season_id_week_id_user_id_pk" PRIMARY KEY("season_id","week_id","user_id");--> statement-breakpoint
ALTER TABLE "user_season_points" ADD COLUMN "data" jsonb;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_season_leaderboard_rank" ON "season_leaderboard_cache" USING btree ("season_id","week_id","rank");--> statement-breakpoint
-- Remove defaults after backfilling existing rows
ALTER TABLE "season_leaderboard_cache" ALTER COLUMN "week_id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "season_leaderboard_cache" ALTER COLUMN "category_breakdown" DROP DEFAULT;
