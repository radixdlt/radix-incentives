CREATE TABLE IF NOT EXISTS "account_activity_points" (
	"account_address" varchar(255) NOT NULL,
	"week_id" uuid NOT NULL,
	"activity_id" text NOT NULL,
	"activity_points" integer NOT NULL,
	CONSTRAINT "account_activity_points_account_address_week_id_activity_id_pk" PRIMARY KEY("account_address","week_id","activity_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "account_activity_points" ADD CONSTRAINT "account_activity_points_account_address_account_address_fk" FOREIGN KEY ("account_address") REFERENCES "public"."account"("address") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "account_activity_points" ADD CONSTRAINT "account_activity_points_week_id_week_id_fk" FOREIGN KEY ("week_id") REFERENCES "public"."week"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "account_activity_points" ADD CONSTRAINT "account_activity_points_activity_id_activity_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."activity"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
