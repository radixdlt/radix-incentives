import { BigNumber } from 'bignumber.js';
import { DappConstants } from 'data';
import { Data, Effect } from 'effect';
import { EntityNonFungibleDataService } from '../../gateway/entityNonFungiblesData';
import {
  type GetNonFungibleBalanceOutput,
  GetNonFungibleBalanceService,
} from '../../gateway/getNonFungibleBalance';
import { KeyValueStoreDataService } from '../../gateway/keyValueStoreData';
import { KeyValueStoreKeysService } from '../../gateway/keyValueStoreKeys';
import type { AtLedgerState } from '../../gateway/schemas';
import { CdpNftData } from './schemas';

const FluxConstants = DappConstants.Flux.constants;

export class FluxParseSborError extends Data.TaggedError('FluxParseSborError')<{
  readonly error: unknown;
}> {}

export class InvalidFluxReceiptItemError extends Data.TaggedError(
  'InvalidFluxReceiptItemError',
)<{}> {}

export type FluxCdpPosition = {
  nft: {
    resourceAddress: ResourceAddress;
    localId: string;
  };
  collateralAddress: string;
  collateralAmount: string;
  realDebt: string;
  poolDebt: string;
  collateralFusdRatio: string;
  interest: string;
  lastInterestChange: string;
  status: string;
  privilegedBorrower: string | null;
};

type ResourceAddress = string;

export type GetFluxCdpsOutput = Effect.Effect.Success<
  Awaited<ReturnType<(typeof GetFluxCdpsService)['Service']>>
>;

export class GetFluxCdpsService extends Effect.Service<GetFluxCdpsService>()(
  'GetFluxCdpsService',
  {
    dependencies: [
      GetNonFungibleBalanceService.Default,
      EntityNonFungibleDataService.Default,
      KeyValueStoreKeysService.Default,
      KeyValueStoreDataService.Default,
    ],
    effect: Effect.gen(function* () {
      const getNonFungibleBalanceService = yield* GetNonFungibleBalanceService;
      const entityNonFungibleDataService = yield* EntityNonFungibleDataService;
      const keyValueStoreKeysService = yield* KeyValueStoreKeysService;
      const keyValueStoreDataService = yield* KeyValueStoreDataService;

      return Effect.fn(function* (input: {
        accountAddresses: string[];
        at_ledger_state: AtLedgerState;
        nonFungibleBalance?: GetNonFungibleBalanceOutput;
        resourceAddresses?: string[];
      }) {
        // First get all CDP NFT IDs for each account
        const result =
          input.nonFungibleBalance ??
          (yield* getNonFungibleBalanceService({
            addresses: input.accountAddresses,
            at_ledger_state: input.at_ledger_state,
            resourceAddresses: input.resourceAddresses,
            options: {
              non_fungible_include_nfids: true,
            },
          }).pipe(Effect.withSpan('getNonFungibleBalanceService')));

        // Collect all NFT IDs
        const allNftIds: string[] = [];
        const accountNftMap = new Map<string, string[]>();

        for (const account of result.items) {
          const nftIds: string[] = [];

          const fluxReceipts = account.nonFungibleResources.filter(
            (resource) =>
              resource.resourceAddress === FluxConstants.receiptResourceAddress,
          );

          for (const fluxReceipt of fluxReceipts) {
            for (const fluxReceiptItem of fluxReceipt.items) {
              nftIds.push(fluxReceiptItem.id);
              allNftIds.push(fluxReceiptItem.id);
            }
          }

          accountNftMap.set(account.address, nftIds);
        }

        if (allNftIds.length === 0) {
          return input.accountAddresses.map((address) => ({
            accountAddress: address,
            cdpPositions: [],
          }));
        }

        // Get NFT data for all CDPs at specific state version
        const nftDataResults = yield* entityNonFungibleDataService({
          resource_address: FluxConstants.receiptResourceAddress,
          non_fungible_ids: allNftIds,
          at_ledger_state: input.at_ledger_state,
        });

        // Get interest rate keys from both KVS
        const [xrdKeys, lsulpKeys] = yield* Effect.all(
          [
            keyValueStoreKeysService({
              key_value_store_address: FluxConstants.xrdKvsAddress,
              at_ledger_state: input.at_ledger_state,
            }),
            keyValueStoreKeysService({
              key_value_store_address: FluxConstants.lsulpKvsAddress,
              at_ledger_state: input.at_ledger_state,
            }),
          ],
          { concurrency: 2 },
        );

        // Get interest rate data from both KVS
        const [xrdInterestDataRaw, lsulpInterestDataRaw] = yield* Effect.all(
          [
            keyValueStoreDataService({
              key_value_store_address: FluxConstants.xrdKvsAddress,
              keys: xrdKeys.items.map((k) => ({
                key_json: k.key.programmatic_json,
              })),
              at_ledger_state: input.at_ledger_state,
            }),
            keyValueStoreDataService({
              key_value_store_address: FluxConstants.lsulpKvsAddress,
              keys: lsulpKeys.items.map((k) => ({
                key_json: k.key.programmatic_json,
              })),
              at_ledger_state: input.at_ledger_state,
            }),
          ],
          { concurrency: 2 },
        );

        const xrdInterestData = xrdInterestDataRaw.flatMap((r) => r.entries);
        const lsulpInterestData = lsulpInterestDataRaw.flatMap(
          (r) => r.entries,
        );

        // Create a map of NFT ID to NFT data for efficient lookup
        const nftDataMap = new Map(
          nftDataResults.map((nftData) => [nftData.non_fungible_id, nftData]),
        );

        // Process CDP data
        const cdps = allNftIds
          .map((nftId) => {
            const nftData = nftDataMap.get(nftId);

            if (!nftData?.data?.programmatic_json) return null;

            const parsed = CdpNftData.safeParse(nftData.data.programmatic_json);

            if (parsed.isErr()) return null;

            const cdpNftData = parsed.value;
            const interestRate = new BigNumber(cdpNftData.interest);
            const poolDebt = new BigNumber(cdpNftData.pool_debt);
            const collateralAddress = cdpNftData.collateral_address;

            // Find matching interest rate info
            const interestData =
              collateralAddress ===
              FluxConstants.collaterals.xrd.collateralAddress
                ? xrdInterestData
                : lsulpInterestData;

            const interestInfo = interestData.find((entry) => {
              const nodeData = entry.value.programmatic_json;
              if (!nodeData || nodeData.kind !== 'Tuple') return false;
              const firstField = nodeData.fields?.[0];
              if (!firstField || firstField.kind !== 'Decimal') return false;
              return new BigNumber(firstField.value).isEqualTo(interestRate);
            });

            let realDebt = poolDebt;
            if (interestInfo) {
              const nodeData = interestInfo.value.programmatic_json;
              if (nodeData.kind === 'Tuple') {
                const tupleFields = nodeData.fields;
                if (tupleFields[1] && tupleFields[1].kind === 'Tuple') {
                  const innerFields = tupleFields[1].fields;
                  if (
                    innerFields[0]?.kind === 'Decimal' &&
                    innerFields[1]?.kind === 'Decimal'
                  ) {
                    const totalPoolDebt = new BigNumber(innerFields[0].value);
                    const realDebtValue = new BigNumber(innerFields[1].value);
                    realDebt = realDebtValue
                      .dividedBy(totalPoolDebt)
                      .multipliedBy(poolDebt);
                  }
                }
              }
            }

            const privilegedBorrower =
              cdpNftData.privileged_borrower.variant === 'Some'
                ? cdpNftData.privileged_borrower.value
                : null;

            return {
              nft: {
                resourceAddress: FluxConstants.receiptResourceAddress,
                localId: nftId,
              },
              collateralAddress: cdpNftData.collateral_address,
              collateralAmount: cdpNftData.collateral_amount,
              poolDebt: cdpNftData.pool_debt,
              realDebt: realDebt.toString(),
              collateralFusdRatio: cdpNftData.collateral_fusd_ratio,
              interest: cdpNftData.interest,
              lastInterestChange: cdpNftData.last_interest_change.toString(),
              status: cdpNftData.status.variant,
              privilegedBorrower,
            };
          })
          .filter((cdp): cdp is FluxCdpPosition => cdp !== null);

        // Map CDPs back to accounts
        return Array.from(accountNftMap.entries()).map(
          ([accountAddress, nftIds]) => ({
            accountAddress,
            cdpPositions: cdps.filter((cdp) =>
              nftIds.includes(cdp.nft.localId),
            ),
          }),
        );
      });
    }),
  },
) {}
