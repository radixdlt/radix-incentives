ALTER TABLE "activity_categories" ADD COLUMN "multiplier" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "activity_categories" ADD COLUMN "dapp_ids" jsonb;--> statement-breakpoint
ALTER TABLE "dapp" ADD COLUMN "logo_file_name" text;