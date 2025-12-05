CREATE TABLE IF NOT EXISTS "user_season_bonuses" (
	"user_id" uuid NOT NULL,
	"season_id" uuid NOT NULL,
	"season_bonus" numeric(10, 6) NOT NULL,
	CONSTRAINT "user_season_bonuses_user_id_season_id_pk" PRIMARY KEY("user_id","season_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_season_bonuses" ADD CONSTRAINT "user_season_bonuses_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_season_bonuses" ADD CONSTRAINT "user_season_bonuses_season_id_season_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."season"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_user_season_bonuses_user_id" ON "user_season_bonuses" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_user_season_bonuses_season_id" ON "user_season_bonuses" USING btree ("season_id");