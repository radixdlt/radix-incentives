ALTER TABLE "activity_categories" ADD COLUMN "dapp_ids" jsonb;--> statement-breakpoint
ALTER TABLE "activity_categories" ADD COLUMN "show_on_earn_page" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "activity_categories" ADD COLUMN "multiplier" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "activity_categories" ADD COLUMN "icon" text DEFAULT 'FileText';--> statement-breakpoint
ALTER TABLE "activity_categories" ADD COLUMN "color" text DEFAULT 'bg-slate-500/10 text-slate-600';--> statement-breakpoint

-- Insert Astrolescent dApp
INSERT INTO "dapp" ("id", "name", "website")
VALUES ('as', 'Astrolescent', 'https://astrolescent.com')
ON CONFLICT ("id") DO UPDATE SET
  "name" = EXCLUDED."name",
  "website" = EXCLUDED."website";--> statement-breakpoint

-- Insert or update activity categories with complete data
INSERT INTO "activity_categories" ("id", "name", "description", "multiplier", "dapp_ids", "show_on_earn_page", "icon", "color")
VALUES
  ('componentCalls', 'dApp interactions', 'Engage with the Radix ecosystem by using dApps and interacting with their features. Each unique dApp you use each week earns points.', false, '[]', true, 'Settings', 'bg-gray-500/10 text-gray-600'),
  ('lendingBlueChips', 'Lend Bluechips', 'Lend hwBTC, hETH, xwBTC, or xETH on Root or WEFT.', false, '["ro", "we"]', true, 'Coins', 'bg-cyan-500/10 text-cyan-600'),
  ('lendingStables', 'Lend USDC/T', 'Lend hUSDC, hUSDT, xUSDC, or xUSDT on Root or WEFT.', false, '["ro", "we"]', true, 'Coins', 'bg-green-500/10 text-green-600'),
  ('lendingXrdDerivative', 'Lend XRD / LSUs', 'Lend XRD or LSULP on Root or WEFT. This also counts for your multiplier!', true, '["ro", "we"]', true, 'Coins', 'bg-blue-500/10 text-blue-600'),
  ('lendingNative', 'Lend Radix native alts', 'Lend Radix native alts on Root or WEFT.', false, '["ro", "we"]', false, 'Coins', 'bg-purple-500/10 text-purple-600'),
  ('maintainXrdBalance', 'XRD Points Multiplier', 'Earn a bonus multiplier based on the XRD, LSUs, and supported pool positions you maintain in your wallet or across dApps. The more you hold, the higher your bonus!', true, '[]', true, 'Wallet', 'bg-blue-500/10 text-blue-600'),
  ('provideBlueChipLiquidityToDex', 'DEX Bluechip Liquidity', 'Provide liquidity on DEXs with hwBTC, hETH, xwBTC, or xETH in supported pools on CaviarNine, Ociswap, and DeFiPlaza. Any XRD paired is included in multiplier.', true, '["c9","oc","dp"]', true, 'Droplet', 'bg-cyan-500/10 text-cyan-600'),
  ('provideNativeLiquidityToDex', 'DEX Radix Native Alts Liquidity', 'Provide liquidity on DEXs using ASTRL, DFP2, EARLY, FLOOP, ILIS, Reddicks, OCI, or WEFT in supported pools on CaviarNine, Ociswap, and DeFiPlaza. Any XRD paired is included in multiplier.', true, '["c9","oc","dp"]', true, 'Droplet', 'bg-purple-500/10 text-purple-600'),
  ('provideStablesLiquidityToDex', 'DEX USDC/T Liquidity', 'Provide liquidity on DEXs using hUSDC, hUSDT, xUSDC, or xUSDT in supported pools on CaviarNine, Ociswap, and DeFiPlaza. Also includes xUSDC added to Surge LP. Any XRD paired is included in multiplier.', true, '["c9","oc","dp"]', true, 'Droplet', 'bg-green-500/10 text-green-600'),
  ('provideXrdDerivativeLiquidityToDex', 'DEX XRD / LSU Liquidity', 'Provide liquidity on DEXs with XRD or LSULP in supported pools on CaviarNine, Ociswap, and DeFiPlaza. This also counts for your multiplier!', true, '["c9","oc","dp"]', true, 'Droplet', 'bg-blue-500/10 text-blue-600'),
  ('tradingVolume', 'Trade on Radix DEXs', 'Earn points by trading on Radix-based DEXs or aggregators on any asset supported in Radix Rewards. Higher trading volume gives you more rewards.', false, '["c9","oc", "as"]', true, 'TrendingUp', 'bg-orange-500/10 text-orange-600'),
  ('transactionFees', 'Pay Transaction Fees', 'Every transaction on Radix counts. Pay transaction fees, interact with the network, and you''ll earn points as part of your regular activity.', false, '[]', true, 'CreditCard', 'bg-red-500/10 text-red-600'),
  ('common', 'Placeholder category', 'Placeholder category.', false, '[]', false, 'FileText', 'bg-slate-500/10 text-slate-600')
ON CONFLICT ("id") DO UPDATE SET
  "name" = EXCLUDED."name",
  "description" = EXCLUDED."description",
  "multiplier" = EXCLUDED."multiplier",
  "dapp_ids" = EXCLUDED."dapp_ids",
  "show_on_earn_page" = EXCLUDED."show_on_earn_page",
  "icon" = EXCLUDED."icon",
  "color" = EXCLUDED."color";