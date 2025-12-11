CREATE TYPE "public"."user_season_reward_claim_status" AS ENUM('pending', 'success', 'failed');--> statement-breakpoint
CREATE TABLE "user_season_reward" (
	"user_id" uuid NOT NULL,
	"season_id" uuid NOT NULL,
	"amount" numeric(18, 6) NOT NULL,
	"account_address" varchar(255) NOT NULL,
	CONSTRAINT "user_season_reward_season_id_user_id_pk" PRIMARY KEY("season_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "user_season_reward_claim" (
	"transaction_id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"season_id" uuid NOT NULL,
	"amount" numeric(18, 6) NOT NULL,
	"status" "user_season_reward_claim_status" DEFAULT 'pending' NOT NULL,
	"data" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"account_address" varchar(255) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_season_reward" ADD CONSTRAINT "user_season_reward_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_season_reward" ADD CONSTRAINT "user_season_reward_season_id_season_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."season"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_season_reward_claim" ADD CONSTRAINT "user_season_reward_claim_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_season_reward_claim" ADD CONSTRAINT "user_season_reward_claim_season_id_season_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."season"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_user_season_reward_claims_user_id_season_id_status" ON "user_season_reward_claim" USING btree ("season_id","user_id","status");--> statement-breakpoint