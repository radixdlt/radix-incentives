DO $$ BEGIN
 CREATE TYPE "public"."milestone_type" AS ENUM('tvl', 'transactions', 'dex_volume', 'wallet_downloads');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "milestone" (
	"season_id" uuid NOT NULL,
	"type" "milestone_type" NOT NULL,
	"goal" numeric(20, 2) NOT NULL,
	"reward_xrd" numeric(20, 0) NOT NULL,
	"current_value" numeric(20, 2) DEFAULT '0' NOT NULL,
	"is_achieved" boolean DEFAULT false NOT NULL,
	"last_updated" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "milestone_season_id_type_goal_pk" PRIMARY KEY("season_id","type","goal")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "transaction_count" (
	"timestamp" timestamp with time zone PRIMARY KEY NOT NULL,
	"total_transaction_count" integer NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "milestone" ADD CONSTRAINT "milestone_season_id_season_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."season"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_milestones_season" ON "milestone" USING btree ("season_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_milestones_last_updated" ON "milestone" USING btree ("last_updated");

-- Insert initial milestone data for the current season
INSERT INTO milestone (season_id, type, goal, reward_xrd, current_value, is_achieved, last_updated)
SELECT
    s.id as season_id,
    mil.type,
    mil.goal,
    mil.reward_xrd,
    '0'::numeric(20,2) as current_value,
    false as is_achieved,
    NOW() as last_updated
FROM season s
CROSS JOIN (
    VALUES
    -- TVL Milestones
    ('tvl'::milestone_type, '10000000'::numeric(20,2), '10000000'::numeric(20,0)),
    ('tvl'::milestone_type, '25000000'::numeric(20,2), '10000000'::numeric(20,0)),
    ('tvl'::milestone_type, '50000000'::numeric(20,2), '10000000'::numeric(20,0)),

    -- Transaction Milestones
    ('transactions'::milestone_type, '150000'::numeric(20,2), '10000000'::numeric(20,0)),
    ('transactions'::milestone_type, '300000'::numeric(20,2), '10000000'::numeric(20,0)),

    -- DEX Volume Milestones
    ('dex_volume'::milestone_type, '150000000'::numeric(20,2), '10000000'::numeric(20,0)),
    ('dex_volume'::milestone_type, '300000000'::numeric(20,2), '10000000'::numeric(20,0)),
    ('dex_volume'::milestone_type, '500000000'::numeric(20,2), '10000000'::numeric(20,0)),

    -- Wallet Download Milestones
    ('wallet_downloads'::milestone_type, '300000'::numeric(20,2), '10000000'::numeric(20,0)),
    ('wallet_downloads'::milestone_type, '500000'::numeric(20,2), '10000000'::numeric(20,0))
) AS mil(type, goal, reward_xrd)
WHERE s.name = 'Season 1'
ON CONFLICT (season_id, type, goal) DO NOTHING;

-- Insert initial transaction count data for September 8th midnight
INSERT INTO transaction_count (timestamp, total_transaction_count)
VALUES ('2025-09-08 00:00:00+00'::timestamptz, 11016312)
ON CONFLICT (timestamp) DO NOTHING;