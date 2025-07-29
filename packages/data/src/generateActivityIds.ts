import { DappId } from "./dapps/dapps";
import { CaviarNineConstants } from "./dapps/caviarnine/constants";
import { getTokenPairFromResourceAddresses } from "./helpers/getTokenPair";
import { Effect, pipe } from "effect";
import { Action } from "./types";
import type { AssetType } from "./assets";
import fs from "node:fs";
import path from "node:path";
import { deduplicate, flatten, sort } from "./helpers/utils";

const activityIdsOutputPath = path.join(
  import.meta.dirname,
  "output",
  "activityIds.ts"
);

const allCaviarNinePools = [
  ...Object.values(CaviarNineConstants.shapeLiquidityPools),
  ...Object.values(CaviarNineConstants.simplePools),
  CaviarNineConstants.HLP,
].map((pool) => ({
  dAppId: DappId.caviarnine,
  tokens: [pool.token_x, pool.token_y],
  componentAddress: pool.componentAddress,
}));

type DeriveActivityDetailsFromPool = {
  dAppId: DappId;
  tokens: string[];
  componentAddress: string;
};

const deriveActivityIds = (
  dAppId: DappId,
  tokenPair: string,
  assets: { assetType: AssetType }[]
) =>
  assets.flatMap((asset) => {
    const holdActivityId = `${dAppId}_${Action.HOLD}_${tokenPair}`;
    const lpActivityId = `${dAppId}_${Action.LP}_${asset.assetType}_${tokenPair}`;

    return asset.assetType === "xrdDerivative"
      ? [lpActivityId, holdActivityId]
      : lpActivityId;
  });

const deriveActivityDetailsFromPool = Effect.fn(function* ({
  dAppId,
  tokens,
  componentAddress,
}: DeriveActivityDetailsFromPool) {
  const { tokenPair, assets } = yield* getTokenPairFromResourceAddresses(
    tokens[0],
    tokens[1]
  );

  const activityIds = pipe(
    deriveActivityIds(dAppId, tokenPair, assets),
    deduplicate
  );

  return {
    dAppId,
    tokenPair,
    componentAddress,
    assets,
    activityIds,
  };
});

const arrayToRecord = (items: string[]) =>
  items.reduce<Record<string, string>>((acc, curr) => {
    acc[curr] = curr;
    return acc;
  }, {});

const runnable = Effect.gen(function* () {
  const caviarNineActivityDetails = yield* Effect.forEach(
    allCaviarNinePools,
    deriveActivityDetailsFromPool
  );

  const activityIds = pipe(
    caviarNineActivityDetails,
    (items) => items.map((item) => item.activityIds),
    flatten,
    deduplicate,
    sort,
    arrayToRecord
  );

  fs.writeFileSync(
    path.join(import.meta.dirname, "output", "caviarNineActivityDetails.json"),
    JSON.stringify(caviarNineActivityDetails, null, 2)
  );

  const formattedOutput = [
    `export const ActivityId = ${JSON.stringify(activityIds, null, 2)} as const`,
    "export type ActivityId = (typeof ActivityId)[keyof typeof ActivityId];",
    `export const matchActivityId = (input: string) =>
    !!ActivityId[input as keyof typeof ActivityId];`,
  ].join("\n\n");

  fs.writeFileSync(activityIdsOutputPath, formattedOutput);
});

Effect.runPromise(runnable);
