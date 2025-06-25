CREATE TABLE IF NOT EXISTS "trading_volume" (
	"account_address" varchar(255) NOT NULL,
	"timestamp" timestamp with time zone NOT NULL,
	"data" jsonb NOT NULL,
	CONSTRAINT "trading_volume_timestamp_account_address_pk" PRIMARY KEY("timestamp","account_address")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "trading_volume" ADD CONSTRAINT "trading_volume_account_address_account_address_fk" FOREIGN KEY ("account_address") REFERENCES "public"."account"("address") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
