CREATE TABLE IF NOT EXISTS "margin_accounts" (
	"margin_account_address" varchar(255) NOT NULL,
	"recovery_account_address" varchar(255),
	"collateral_account_address" varchar(255),
	"trading_account_address" varchar(255),
	"state_version" integer NOT NULL,
	CONSTRAINT "margin_accounts_margin_account_address_state_version_pk" PRIMARY KEY("margin_account_address","state_version")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_margin_accounts_recovery" ON "margin_accounts" USING btree ("recovery_account_address");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_margin_accounts_collateral" ON "margin_accounts" USING btree ("collateral_account_address");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_margin_accounts_trading" ON "margin_accounts" USING btree ("trading_account_address");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_margin_accounts_state_version" ON "margin_accounts" USING btree ("state_version");