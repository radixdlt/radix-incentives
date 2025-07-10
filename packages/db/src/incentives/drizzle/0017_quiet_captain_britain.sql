CREATE TABLE IF NOT EXISTS "activity_category_weeks" (
	"activity_category_id" text NOT NULL,
	"week_id" uuid NOT NULL,
	"points_pool" integer NOT NULL,
	CONSTRAINT "activity_category_week_pk" PRIMARY KEY("week_id","activity_category_id")
);
--> statement-breakpoint
ALTER TABLE "activity_week" ADD COLUMN "multiplier" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "activity_category_weeks" ADD CONSTRAINT "activity_category_weeks_activity_category_id_activity_categories_id_fk" FOREIGN KEY ("activity_category_id") REFERENCES "public"."activity_categories"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "activity_category_weeks" ADD CONSTRAINT "activity_category_weeks_week_id_week_id_fk" FOREIGN KEY ("week_id") REFERENCES "public"."week"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "activity_week" DROP COLUMN IF EXISTS "points_pool";--> statement-breakpoint
ALTER TABLE "activity_week" DROP COLUMN IF EXISTS "status";