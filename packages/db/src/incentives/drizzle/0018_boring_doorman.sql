ALTER TABLE "week" ADD COLUMN "processed" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "season" DROP COLUMN IF EXISTS "start_date";--> statement-breakpoint
ALTER TABLE "season" DROP COLUMN IF EXISTS "end_date";--> statement-breakpoint
ALTER TABLE "week" DROP COLUMN IF EXISTS "status";