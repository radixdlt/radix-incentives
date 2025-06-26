-- Drop existing constraints if they exist
ALTER TABLE "component_calls" DROP CONSTRAINT IF EXISTS "component_calls_account_address_account_address_fk";
--> statement-breakpoint
ALTER TABLE "component_calls" DROP CONSTRAINT IF EXISTS "component_calls_account_address_timestamp_pk";
--> statement-breakpoint

-- Add new columns if they don't exist
ALTER TABLE "component_calls" ADD COLUMN IF NOT EXISTS "user_id" uuid;
--> statement-breakpoint
ALTER TABLE "component_calls" ADD COLUMN IF NOT EXISTS "data" jsonb;
--> statement-breakpoint

-- If user_id column exists but is nullable, we need to handle existing data
-- Since this is a structural change and there shouldn't be existing data, 
-- we'll make it NOT NULL after adding it
DO $$ 
BEGIN
  -- Check if user_id column exists and is nullable
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'component_calls' 
    AND column_name = 'user_id' 
    AND is_nullable = 'YES'
  ) THEN
    -- Remove any existing rows if they have null user_id (shouldn't happen in practice)
    DELETE FROM "component_calls" WHERE "user_id" IS NULL;
    -- Make user_id NOT NULL
    ALTER TABLE "component_calls" ALTER COLUMN "user_id" SET NOT NULL;
  END IF;
  
  -- Check if data column exists and is nullable
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'component_calls' 
    AND column_name = 'data' 
    AND is_nullable = 'YES'
  ) THEN
    -- Remove any existing rows if they have null data (shouldn't happen in practice)
    DELETE FROM "component_calls" WHERE "data" IS NULL;
    -- Make data NOT NULL
    ALTER TABLE "component_calls" ALTER COLUMN "data" SET NOT NULL;
  END IF;
END $$;
--> statement-breakpoint

-- Add new primary key constraint if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'component_calls' 
    AND constraint_name = 'component_calls_user_id_timestamp_pk'
  ) THEN
    ALTER TABLE "component_calls" ADD CONSTRAINT "component_calls_user_id_timestamp_pk" PRIMARY KEY("user_id","timestamp");
  END IF;
END $$;
--> statement-breakpoint

-- Add foreign key constraint if it doesn't exist
DO $$ BEGIN
 IF NOT EXISTS (
   SELECT 1 FROM information_schema.table_constraints 
   WHERE table_name = 'component_calls' 
   AND constraint_name = 'component_calls_user_id_user_id_fk'
 ) THEN
   ALTER TABLE "component_calls" ADD CONSTRAINT "component_calls_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
 END IF;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

-- Drop old columns if they exist
ALTER TABLE "component_calls" DROP COLUMN IF EXISTS "account_address";
--> statement-breakpoint
ALTER TABLE "component_calls" DROP COLUMN IF EXISTS "calls";