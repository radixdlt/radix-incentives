import fs from 'node:fs';
import path from 'node:path';
import { NodeSdk } from '@effect/opentelemetry';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { GetAllValidatorsService } from 'api/common/gateway/getAllValidators';
import { GetLedgerStateService } from 'api/common/gateway/getLedgerState';
import { SnapshotService } from 'api/incentives';
import { GetAccountAddressesService } from 'api/incentives/account/getAccounts';
import { AggregateAccountBalanceService } from 'api/incentives/account-balance/aggregateAccountBalance';
import { GetAccountBalancesAtStateVersionService } from 'api/incentives/account-balance/getAccountBalancesAtStateVersion';
import { UpsertAccountBalancesService } from 'api/incentives/account-balance/upsertAccountBalance';
import { AccountBalanceState } from 'api/incentives/account-balance/v2/accountBalanceState';
import { GetAccountBalancesAtStateVersionV2 } from 'api/incentives/account-balance/v2/getAccountBalances';
import { ConfigService } from 'api/incentives/config/configService';
import { SnapshotV2 } from 'api/incentives/snapshot/v2/snapshotV2';
import BigNumber from 'bignumber.js';
import { Effect, Layer, Logger, Record as R } from 'effect';

let v1Data: Record<string, { activityId: string; usdValue: string }> = {};
let v2Data: Record<string, { activityId: string; usdValue: string }> = {};

const timestamp = new Date('2025-11-18T10:22:00.000Z');

export const NodeSdkLive = NodeSdk.layer(() => ({
  resource: { serviceName: 'snapshot' },
  spanProcessor: new BatchSpanProcessor(
    new OTLPTraceExporter({
      url: 'http://127.0.0.1:4318/v1/traces',
    }),
  ),
}));

const snapshotV1Layers = Layer.mergeAll(
  GetLedgerStateService.Default,
  GetAccountBalancesAtStateVersionService.Default,
  AggregateAccountBalanceService.Default,
  GetAllValidatorsService.Default,
  ConfigService.Default,
);

const snapshotV1Runnable = Effect.gen(function* () {
  const snapshot = yield* SnapshotService;

  const start = performance.now();

  yield* snapshot({
    timestamp,
    batchSize: 10_000,
    addDummyData: false,
  });

  const end = performance.now();
  yield* Effect.log(`SnapshotV1 took ${end - start} milliseconds`);
}).pipe(
  Effect.provide(SnapshotService.DefaultWithoutDependencies),
  Effect.provide(NodeSdkLive),
  Effect.provide(snapshotV1Layers),
  Effect.provideService(
    GetAccountAddressesService,
    new GetAccountAddressesService(() =>
      Effect.succeed([
        'account_rdx12xl2meqtelz47mwp3nzd72jkwyallg5yxr9hkc75ac4qztsxulfpew',
      ]),
    ),
  ),
  Effect.provideService(
    UpsertAccountBalancesService,
    new UpsertAccountBalancesService((input) =>
      Effect.gen(function* () {
        const data = input[0].data as {
          activityId: string;
          usdValue: string;
        }[];
        v1Data = R.fromIterableBy(data, (item) => item.activityId);
      }),
    ),
  ),
);

await Effect.runPromise(snapshotV1Runnable.pipe(Effect.provide(Logger.pretty)));

const snapshotV2Layers = Layer.mergeAll(
  GetLedgerStateService.Default,
  GetAccountBalancesAtStateVersionService.Default,
  AggregateAccountBalanceService.Default,
  GetAllValidatorsService.Default,
  ConfigService.Default,
  AccountBalanceState.Default,
  GetAccountBalancesAtStateVersionV2.Default,
);

const snapshotV2Runnable = Effect.gen(function* () {
  const snapshotV2 = yield* SnapshotV2;

  const start = performance.now();

  yield* snapshotV2({
    timestamp,
    batchSize: 10_000,
    addDummyData: false,
  });

  const end = performance.now();
  yield* Effect.log(`SnapshotV2 took ${end - start} milliseconds`);
}).pipe(
  Effect.provide(NodeSdkLive),
  Effect.provide(SnapshotV2.DefaultWithoutDependencies),
  Effect.provide(snapshotV2Layers),
  Effect.provideService(
    GetAccountAddressesService,
    new GetAccountAddressesService(() =>
      Effect.succeed([
        'account_rdx12xl2meqtelz47mwp3nzd72jkwyallg5yxr9hkc75ac4qztsxulfpew',
      ]),
    ),
  ),
  Effect.provideService(
    UpsertAccountBalancesService,
    new UpsertAccountBalancesService((input) =>
      Effect.gen(function* () {
        const data = input[0].data as {
          activityId: string;
          usdValue: string;
        }[];
        v2Data = R.fromIterableBy(data, (item) => item.activityId);
      }),
    ),
  ),
);

await Effect.runPromise(snapshotV2Runnable.pipe(Effect.provide(Logger.pretty)));

const items = Object.entries(v1Data).map(([activityId, data]) => {
  const v2 = v2Data[activityId];
  if (!v2) {
    console.log(`${activityId} not found in v2`);
    return;
  }
  const v1Value = new BigNumber(data.usdValue).decimalPlaces(2);
  const v2Value = new BigNumber(v2.usdValue);
  if (!v1Value.eq(v2Value)) {
    console.log(
      `❌ ${activityId} mismatch: 
      v1: ${v1Value.toString()}
      v2: ${v2Value.toString()}`,
    );
  }
  return {
    activityId,
    v1Value: v1Value.toString(),
    v2Value: v2Value.toString(),
  };
});

const outputPath = path.join(import.meta.dirname, 'snapshot-comparison.json');

fs.writeFileSync(outputPath, JSON.stringify(items, null, 2));
console.log(`file written to ${outputPath}`);
