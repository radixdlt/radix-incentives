CREATE TABLE IF NOT EXISTS "voting_power" (
	"timestamp" timestamp with time zone DEFAULT now() NOT NULL,
	"account_address" varchar(255) NOT NULL,
	"voting_power" text NOT NULL,
	"balances" jsonb,
	CONSTRAINT "voting_power_timestamp_account_address_pk" PRIMARY KEY("timestamp","account_address")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "voting_power" ADD CONSTRAINT "voting_power_account_address_account_address_fk" FOREIGN KEY ("account_address") REFERENCES "public"."account"("address") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
