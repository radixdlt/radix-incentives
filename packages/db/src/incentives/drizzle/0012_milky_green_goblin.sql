CREATE TABLE IF NOT EXISTS "component_calls" (
	"account_address" varchar(255) NOT NULL,
	"calls" integer NOT NULL,
	"timestamp" timestamp with time zone NOT NULL,
	CONSTRAINT "component_calls_account_address_timestamp_pk" PRIMARY KEY("account_address","timestamp")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "component_calls" ADD CONSTRAINT "component_calls_account_address_account_address_fk" FOREIGN KEY ("account_address") REFERENCES "public"."account"("address") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
