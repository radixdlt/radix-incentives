import { layer } from '@effect/vitest';
import { seasons } from 'db/incentives';
import { Effect, Layer, Logger } from 'effect';
import { SeasonId } from 'shared/brandedTypes';
import { beforeAll, expect } from 'vitest';
import { AccountAddress } from '../../account-balance/v2/schemas';
import { DbService } from '../../db/dbClient';
import type { AccountWithLabel } from './seasonVester';
import { SeasonVesterService } from './seasonVester';

const STATE_VERSION = 430517688;
const COMPONENT_ADDRESS =
  'component_rdx1cqvk5tjxc2atwzj3vd88pfjpxav2dsam5y0qzydtsntrq9ajhh5a5j';
const ACCOUNT_WITH_7_LP_TOKENS =
  'account_rdx12xl2meqtelz47mwp3nzd72jkwyallg5yxr9hkc75ac4qztsxulfpew';
const ACCOUNT_WITH_2_LP_TOKENS =
  'account_rdx129zryfdcuyvwl00rxkscec24re8wts0526fqqfphuv37n9z0cyd307';
const SEASON_ID = '036031e3-8bfb-4d2f-b653-f05c76f07704';

const TestLayer = SeasonVesterService.Default.pipe(
  Layer.provide(Logger.pretty),
);

layer(TestLayer)('SeasonVesterService', (it) => {
  beforeAll(async () => {
    // Insert test season with component address
    await Effect.gen(function* () {
      const db = yield* DbService;
      yield* db.use((database) =>
        database
          .insert(seasons)
          .values({
            id: SEASON_ID,
            name: 'Test Season',
            status: 'completed',
            config: {
              seasonRewardComponentAddress: COMPONENT_ADDRESS,
            },
          })
          .onConflictDoUpdate({
            target: seasons.id,
            set: {
              config: {
                seasonRewardComponentAddress: COMPONENT_ADDRESS,
              },
            },
          }),
      );
    }).pipe(Effect.provide(DbService.Default), Effect.runPromise);
  });
  it.effect('should get vester info at specific state version', () =>
    Effect.gen(function* () {
      const service = yield* SeasonVesterService;

      const result = yield* service.getVesterInfo({
        seasonId: SeasonId.make(SEASON_ID),
        at_ledger_state: { state_version: STATE_VERSION },
      });

      expect(result).toBeDefined();
      expect(result.poolUnitResourceAddress).toBe(
        'resource_rdx1th428swhg2e46v23pkk46j89q40gyjzlkxt6f9sc9msu6tz9uklfqr',
      );
      expect(result.poolAddress).toBe(
        'pool_rdx1cjs3zwnwyj0ekrak5xhq9ewf938s58a0v0u93qpajhwlc7c9vcxyks',
      );
      expect(result.currentValuePerUnit).toBe('0.20019495180111618406');
      expect(result.maturityValuePerUnit).toBe('1.05560142046302400866');
      expect(result.vestEndTimestamp).toBe('2026-12-23T13:11:56.000Z');
    }).pipe(Effect.provide(DbService.Default)),
  );

  it.effect('should get account balances at specific state version', () =>
    Effect.gen(function* () {
      const service = yield* SeasonVesterService;

      const accounts: readonly AccountWithLabel[] = [
        {
          address: AccountAddress(ACCOUNT_WITH_7_LP_TOKENS),
          label: 'Test Account',
        },
      ];

      const result = yield* service.getAccountBalances({
        seasonId: SeasonId.make(SEASON_ID),
        accounts,
        at_ledger_state: { state_version: STATE_VERSION },
      });

      expect(result).toBeDefined();
      expect(result.length).toBe(1);
      expect(result[0]?.address).toBe(ACCOUNT_WITH_7_LP_TOKENS);
      expect(result[0]?.balance).toBe('7');
      expect(result[0]?.label).toBe('Test Account');
    }).pipe(Effect.provide(DbService.Default)),
  );

  it.effect('should return empty array for no accounts', () =>
    Effect.gen(function* () {
      const service = yield* SeasonVesterService;

      const result = yield* service.getAccountBalances({
        seasonId: SeasonId.make(SEASON_ID),
        accounts: [],
        at_ledger_state: { state_version: STATE_VERSION },
      });

      expect(result).toEqual([]);
    }).pipe(Effect.provide(DbService.Default)),
  );

  it.effect(
    'should sort accounts by balance descending when multiple accounts',
    () =>
      Effect.gen(function* () {
        const service = yield* SeasonVesterService;

        const accounts: readonly AccountWithLabel[] = [
          {
            address: AccountAddress(ACCOUNT_WITH_2_LP_TOKENS),
            label: 'Account with 2 tokens',
          },
          {
            address: AccountAddress(ACCOUNT_WITH_7_LP_TOKENS),
            label: 'Account with 7 tokens',
          },
        ];

        const result = yield* service.getAccountBalances({
          seasonId: SeasonId.make(SEASON_ID),
          accounts,
          at_ledger_state: { state_version: STATE_VERSION },
        });

        expect(result).toBeDefined();
        expect(result.length).toBe(2);

        // First account should have 7 tokens (sorted descending)
        expect(result[0]?.address).toBe(ACCOUNT_WITH_7_LP_TOKENS);
        expect(result[0]?.balance).toBe('7');
        expect(result[0]?.label).toBe('Account with 7 tokens');

        // Second account should have 2 tokens
        expect(result[1]?.address).toBe(ACCOUNT_WITH_2_LP_TOKENS);
        expect(result[1]?.balance).toBe('2');
        expect(result[1]?.label).toBe('Account with 2 tokens');
      }).pipe(Effect.provide(DbService.Default)),
  );
});
