import { Effect, Layer } from "effect";
import { GatewayApiClientLive } from "../../gateway/gatewayApiClient";
import { GetEntityDetailsServiceLive } from "../../gateway/getEntityDetails";
import { GetLedgerStateLive } from "../../gateway/getLedgerState";
import { EntityFungiblesPageLive } from "../../gateway/entityFungiblesPage";
import { GetNonFungibleBalanceLive } from "../../gateway/getNonFungibleBalance";
import { EntityNonFungiblesPageLive } from "../../gateway/entityNonFungiblesPage";
import { EntityNonFungibleDataLive } from "../../gateway/entityNonFungiblesData";
import {
  GetWeftFinancePositionsLive,
  GetWeftFinancePositionsService,
} from "./getWeftFinancePositions";
import { GetFungibleBalanceLive } from "../../gateway/getFungibleBalance";
import { GetComponentStateLive } from "../../gateway/getComponentState";
import { GetKeyValueStoreLive } from "../../gateway/getKeyValueStore";
import { KeyValueStoreDataLive } from "../../gateway/keyValueStoreData";
import { KeyValueStoreKeysLive } from "../../gateway/keyValueStoreKeys";
import { GetNftResourceManagersLive } from "../../gateway/getNftResourceManagers";
import { GetNonFungibleIdsLive } from "../../gateway/getNonFungibleIds";
import { UnstakingReceiptProcessorLive } from "../../staking/unstakingReceiptProcessor";

// Provide all dependencies in correct order, EntityNonFungiblesPageLive only once
const fullLayer = GetWeftFinancePositionsLive.pipe(
  Layer.provide(
    GetNonFungibleBalanceLive.pipe(
      Layer.provide(
        GetEntityDetailsServiceLive.pipe(Layer.provide(GatewayApiClientLive))
      ),
      Layer.provide(GatewayApiClientLive),
      Layer.provide(
        EntityFungiblesPageLive.pipe(Layer.provide(GatewayApiClientLive))
      ),
      Layer.provide(
        EntityNonFungiblesPageLive.pipe(Layer.provide(GatewayApiClientLive))
      ),
      Layer.provide(
        EntityNonFungibleDataLive.pipe(Layer.provide(GatewayApiClientLive))
      ),
      Layer.provide(
        GetLedgerStateLive.pipe(Layer.provide(GatewayApiClientLive))
      )
    )
  ),
  Layer.provide(
    EntityFungiblesPageLive.pipe(Layer.provide(GatewayApiClientLive))
  ),
  Layer.provide(
    GetFungibleBalanceLive.pipe(
      Layer.provide(
        GetEntityDetailsServiceLive.pipe(Layer.provide(GatewayApiClientLive))
      ),
      Layer.provide(GatewayApiClientLive),
      Layer.provide(
        EntityFungiblesPageLive.pipe(Layer.provide(GatewayApiClientLive))
      ),
      Layer.provide(
        GetLedgerStateLive.pipe(Layer.provide(GatewayApiClientLive))
      )
    )
  ),
  Layer.provide(
    GetEntityDetailsServiceLive.pipe(Layer.provide(GatewayApiClientLive))
  ),
  Layer.provide(
    GetComponentStateLive.pipe(
      Layer.provide(
        GetEntityDetailsServiceLive.pipe(Layer.provide(GatewayApiClientLive))
      ),
      Layer.provide(GatewayApiClientLive)
    )
  ),
  Layer.provide(
    GetKeyValueStoreLive.pipe(
      Layer.provide(GatewayApiClientLive),
      Layer.provide(
        KeyValueStoreDataLive.pipe(Layer.provide(GatewayApiClientLive))
      ),
      Layer.provide(
        KeyValueStoreKeysLive.pipe(Layer.provide(GatewayApiClientLive))
      )
    )
  ),
  Layer.provide(GetNftResourceManagersLive),
  Layer.provide(GetNonFungibleIdsLive),
  Layer.provide(
    EntityNonFungibleDataLive.pipe(Layer.provide(GatewayApiClientLive))
  ),
  Layer.provide(
    KeyValueStoreDataLive.pipe(Layer.provide(GatewayApiClientLive))
  ),
  Layer.provide(
    KeyValueStoreKeysLive.pipe(Layer.provide(GatewayApiClientLive))
  ),
  Layer.provide(GatewayApiClientLive),
  Layer.provide(GetLedgerStateLive.pipe(Layer.provide(GatewayApiClientLive))),
  Layer.provide(
    EntityNonFungiblesPageLive.pipe(Layer.provide(GatewayApiClientLive))
  ), // Only once
  Layer.provide(
    UnstakingReceiptProcessorLive.pipe(
      Layer.provide(
        EntityNonFungibleDataLive.pipe(Layer.provide(GatewayApiClientLive))
      )
    )
  )
);

const program = Effect.provide(
  Effect.gen(function* () {
    const getWeftFinancePositions = yield* GetWeftFinancePositionsService;
    return yield* getWeftFinancePositions({
      accountAddresses: [
        "account_rdx12xl2meqtelz47mwp3nzd72jkwyallg5yxr9hkc75ac4qztsxulfpew",
      ],
      at_ledger_state: {
        state_version: 322574776,
      },
      validatorClaimNftMap: new Map([
        // Add some example validator claim NFT mappings for testing
        [
          "validator_rdx1sd5368vqdmjk0y2w7ymdts02cz9c52858gpyny56xdvzuheepdeyy0",
          "resource_rdx1ng4kv5702z0jl6eyuw9xjzfqsd82z946vl7qm04n63s0q9jm2ktus6",
        ],
        [
          "validator_rdx1sdzyt4p0x7q7n7q7z7q7n7q7z7q7n7q7z7q7n7q7z7q7n7q7z7q7n",
          "resource_rdx1another_example_claim_nft_resource_address_here",
        ],
      ]),
    });
  }),
  fullLayer
);

describe("GetWeftFinancePositionsService", () => {
  it("should get weft finance positions", async () => {
    const result = await Effect.runPromise(program);

    console.log("=== Weft Finance Positions ===");
    for (const account of result) {
      console.log(`\nAccount: ${account.address}`);

      console.log(`\nLending Positions (${account.lending.length}):`);
      for (const lending of account.lending) {
        console.log(`  Wrapped Asset: ${lending.wrappedAsset.resourceAddress}`);
        console.log(`    Amount: ${lending.wrappedAsset.amount.toString()}`);
        console.log(
          `  Unwrapped Asset: ${lending.unwrappedAsset.resourceAddress}`
        );
        console.log(`    Amount: ${lending.unwrappedAsset.amount.toString()}`);
        console.log(
          `  Unit to Asset Ratio: ${lending.unitToAssetRatio.toString()}`
        );
        console.log("  ---");
      }

      console.log(`\nCollateral Positions (${account.collateral.length}):`);
      for (const collateral of account.collateral) {
        console.log(`  Resource: ${collateral.resourceAddress}`);
        console.log(`  Amount: ${collateral.amount.toString()}`);
        console.log("  ---");
      }

      console.log(
        `\nUnstaking Receipts (${account.unstakingReceipts.length}):`
      );
      for (const receipt of account.unstakingReceipts) {
        console.log(`  Resource: ${receipt.resourceAddress}`);
        console.log(`  NFT ID: ${receipt.id}`);
        console.log(`  Claim Amount: ${receipt.claimAmount.toString()}`);
        console.log(`  Claim Epoch: ${receipt.claimEpoch}`);
        console.log(`  Validator: ${receipt.validatorAddress}`);
        console.log("  ---");
      }
    }

    // Also log the raw JSON for comparison
    console.log("\n=== Raw JSON (for debugging) ===");
    console.log(JSON.stringify(result, null, 2));
  });
});
