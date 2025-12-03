CREATE TABLE IF NOT EXISTS "resource_reward_week" (
	"address" varchar(255) NOT NULL,
	"week_id" uuid NOT NULL,
	"points" integer NOT NULL,
	"weekly_limit" integer,
	CONSTRAINT "resource_reward_week_address_week_id_pk" PRIMARY KEY("address","week_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "resource_reward_week" ADD CONSTRAINT "resource_reward_week_address_resource_reward_definition_address_fk" FOREIGN KEY ("address") REFERENCES "public"."resource_reward_definition"("address") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "resource_reward_week" ADD CONSTRAINT "resource_reward_week_week_id_week_id_fk" FOREIGN KEY ("week_id") REFERENCES "public"."week"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_resource_reward_week_week_id" ON "resource_reward_week" USING btree ("week_id");--> statement-breakpoint

-- Migrate existing resource reward definitions to week-specific entries
-- Copy all existing resource rewards to all weeks
INSERT INTO "resource_reward_week" (address, week_id, points, weekly_limit)
SELECT
    rrd.address,
    w.id as week_id,
    rrd.points,
    rrd.weekly_limit
FROM "resource_reward_definition" rrd
CROSS JOIN "week" w;

--> statement-breakpoint
ALTER TABLE "resource_reward_definition" DROP COLUMN IF EXISTS "points";--> statement-breakpoint
ALTER TABLE "resource_reward_definition" DROP COLUMN IF EXISTS "weekly_limit";