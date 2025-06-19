CREATE TABLE IF NOT EXISTS "transaction_fees" (
	"transaction_id" text NOT NULL,
	"account_address" varchar(255) NOT NULL,
	"fee" numeric(18, 2) NOT NULL,
	"timestamp" timestamp with time zone NOT NULL,
	CONSTRAINT "transaction_fees_timestamp_account_address_transaction_id_pk" PRIMARY KEY("timestamp","account_address","transaction_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "transaction_fees" ADD CONSTRAINT "transaction_fees_account_address_account_address_fk" FOREIGN KEY ("account_address") REFERENCES "public"."account"("address") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
