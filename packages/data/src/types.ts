import { z } from "zod";
import type { ActivityCategoryId } from "./activityCategories";
import type { TokenDetails } from "./helpers/getTokenPair";
import type { DappId } from "./dapps/dapps";

export const AccountBalanceData = z.object({
  activityId: z.string(),
  usdValue: z.string(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  poolShare: z.record(z.string(), z.number()).optional(),
});

export type AccountBalanceData = Omit<
  z.infer<typeof AccountBalanceData>,
  "activityId"
> & {
  activityId: string;
};

export const Action = {
  LP: "lp",
  HOLD: "ho",
  TRADE: "tr",
  LEND: "le",
  OTHER: "ot",
};

export type Action = (typeof Action)[keyof typeof Action];

export type ActivityData = {
  activityId: string;
  categoryId: ActivityCategoryId;
  action: Action;
  componentAddresses: string[];
  dAppId: DappId;
  tokenPair: string;
  assets: TokenDetails[];
};
