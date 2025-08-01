CREATE TABLE IF NOT EXISTS "category_leaderboard_cache" (
	"week_id" uuid NOT NULL,
	"category_id" varchar(255) NOT NULL,
	"user_id" uuid NOT NULL,
	"total_points" numeric(18, 6) NOT NULL,
	"rank" integer NOT NULL,
	"activity_breakdown" jsonb NOT NULL,
	"last_updated" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "category_leaderboard_cache_week_id_category_id_user_id_pk" PRIMARY KEY("week_id","category_id","user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "leaderboard_stats_cache" (
	"cache_key" varchar(255) PRIMARY KEY NOT NULL,
	"total_users" integer NOT NULL,
	"median" numeric(18, 6),
	"average" numeric(18, 6),
	"last_updated" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "season_leaderboard_cache" (
	"season_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"total_points" numeric(18, 6) NOT NULL,
	"rank" integer NOT NULL,
	"last_updated" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "season_leaderboard_cache_season_id_user_id_pk" PRIMARY KEY("season_id","user_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "category_leaderboard_cache" ADD CONSTRAINT "category_leaderboard_cache_week_id_week_id_fk" FOREIGN KEY ("week_id") REFERENCES "public"."week"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "category_leaderboard_cache" ADD CONSTRAINT "category_leaderboard_cache_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "season_leaderboard_cache" ADD CONSTRAINT "season_leaderboard_cache_season_id_season_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."season"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "season_leaderboard_cache" ADD CONSTRAINT "season_leaderboard_cache_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_category_leaderboard_rank" ON "category_leaderboard_cache" USING btree ("week_id","category_id","rank");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_category_leaderboard_user" ON "category_leaderboard_cache" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_season_leaderboard_rank" ON "season_leaderboard_cache" USING btree ("season_id","rank");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_season_leaderboard_user" ON "season_leaderboard_cache" USING btree ("user_id");