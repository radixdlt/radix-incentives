DROP INDEX IF EXISTS "activity_week_uidx";--> statement-breakpoint
ALTER TABLE "activity_week" ADD CONSTRAINT "activity_week_activity_id_week_id_pk" PRIMARY KEY("activity_id","week_id");--> statement-breakpoint
ALTER TABLE "activity_week" DROP COLUMN IF EXISTS "id";