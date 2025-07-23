CREATE TABLE IF NOT EXISTS "component_whitelist" (
	"component_address" varchar(255) PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_component_whitelist_address" ON "component_whitelist" USING btree ("component_address");