ALTER TABLE "dapp" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "dapp" ADD COLUMN "long_description" text;--> statement-breakpoint
ALTER TABLE "dapp" ADD COLUMN "tags" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "dapp" ADD COLUMN "resources" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "dapp" ADD COLUMN "show_on_earn_page" boolean DEFAULT true NOT NULL;