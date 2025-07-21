CREATE TABLE IF NOT EXISTS "dapp" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"website" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "activity" ADD COLUMN "dapp" text;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "activity" ADD CONSTRAINT "activity_dapp_dapp_id_fk" FOREIGN KEY ("dapp") REFERENCES "public"."dapp"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
