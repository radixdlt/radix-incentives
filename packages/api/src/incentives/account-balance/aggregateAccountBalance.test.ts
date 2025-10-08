import { layer } from '@effect/vitest';
import { Effect } from 'effect';

import { AggregateAccountBalanceService } from './aggregateAccountBalance';
import { accountBalanceFixture } from './fixtures/accountBalances';

// TODO: Re-enable after updating fixtures for new component definitions
layer(AggregateAccountBalanceService.Default)(
  'aggregateAccountBalance',
  (it) => {
    it.effect.skip(
      'should aggregate account balance',
      Effect.fnUntraced(function* () {
        const aggregateAccountBalanceService = yield* Effect.provide(
          AggregateAccountBalanceService,
          AggregateAccountBalanceService.Default,
        );

        const result = yield* aggregateAccountBalanceService(
          // @ts-expect-error
          accountBalanceFixture.input,
        );

        for (const [index, item] of result[0].data.entries()) {
          const expected = accountBalanceFixture.output.data[index];
          expect(item.activityId, `activityId at index ${index}`).toEqual(
            expected.activityId,
          );
          expect(item.usdValue, `usdValue at index ${index}`).toEqual(
            expected.usdValue,
          );
        }
      }),
    );
  },
);

// layer(GetFungibleBalance.Default)('GetFungibleBalance', (it) => {
//   it.effect(
//     'should get account balance',
//     Effect.fnUntraced(function* () {
//       const getFungibleBalance = yield* GetFungibleBalance;
//       const gatewayApiClient = yield* Effect.provide(
//         GatewayApiClient,
//         GatewayApiClient.Default,
//       );

//       const ledgerState =
//         yield* gatewayApiClient.stream.innerClient.streamTransactions({
//           streamTransactionsRequest: {
//             limit_per_page: 1,
//             at_ledger_state: {
//               timestamp: new Date('2026-09-03T00:00:00.000Z'),
//             },
//           },
//         });

//       console.log(ledgerState);

//       const result = yield* getFungibleBalance({
//         addresses: ACCOUNT_ADDRESSES,
//         at_ledger_state: {
//           state_version: ledgerState.ledger_state.state_version,
//         },
//       });
//     }),
//   );
// });
