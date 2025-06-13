CREATE TABLE IF NOT EXISTS "season_points_multiplier" (
	"user_id" uuid NOT NULL,
	"week_id" uuid NOT NULL,
	"multiplier" numeric(18, 2) NOT NULL,
	"cumulative_twa_balance" integer NOT NULL,
	"total_twa_balance" integer NOT NULL,
	CONSTRAINT "season_points_multiplier_user_id_week_id_pk" PRIMARY KEY("user_id","week_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "season_points_multiplier" ADD CONSTRAINT "season_points_multiplier_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "season_points_multiplier" ADD CONSTRAINT "season_points_multiplier_week_id_week_id_fk" FOREIGN KEY ("week_id") REFERENCES "public"."week"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
