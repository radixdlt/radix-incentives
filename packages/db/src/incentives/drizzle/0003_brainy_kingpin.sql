CREATE TABLE IF NOT EXISTS "user_season_points" (
	"user_id" uuid NOT NULL,
	"season_id" uuid NOT NULL,
	"week_id" uuid NOT NULL,
	"points" integer NOT NULL,
	CONSTRAINT "user_season_points_user_id_season_id_week_id_pk" PRIMARY KEY("user_id","season_id","week_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_season_points" ADD CONSTRAINT "user_season_points_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_season_points" ADD CONSTRAINT "user_season_points_season_id_season_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."season"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_season_points" ADD CONSTRAINT "user_season_points_week_id_week_id_fk" FOREIGN KEY ("week_id") REFERENCES "public"."week"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "week" DROP COLUMN IF EXISTS "is_processed";