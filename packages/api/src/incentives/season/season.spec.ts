import { layer } from '@effect/vitest';
import { seasons } from 'db/incentives';
import { eq } from 'drizzle-orm';
import { Effect, Layer, Logger } from 'effect';
import { SeasonId } from 'shared/brandedTypes';
import { beforeEach, expect } from 'vitest';
import { truncateTables } from '../../test-helpers/truncateTables';
import { DbService } from '../db/dbClient';
import { SeasonService } from './season';

const createSeason = (
  overrides?: Partial<{
    name: string;
    status: 'active' | 'completed' | 'upcoming';
  }>,
) =>
  Effect.gen(function* () {
    const db = yield* DbService;
    const [season] = yield* db.use((database) =>
      database
        .insert(seasons)
        .values({
          name: overrides?.name ?? 'Test Season',
          status: overrides?.status ?? 'completed',
        })
        .returning(),
    );
    return season;
  });

const setSeasonConfig = (seasonId: string, config: Record<string, unknown>) =>
  Effect.gen(function* () {
    const db = yield* DbService;
    yield* db.use((database) =>
      database.update(seasons).set({ config }).where(eq(seasons.id, seasonId)),
    );
  });

const TestLayer = SeasonService.Default.pipe(Layer.provide(Logger.pretty));

layer(TestLayer)('SeasonService', (it) => {
  beforeEach(async () => {
    await truncateTables();
  });

  it.effect(
    'getConfig - returns default config when season has empty config',
    () =>
      Effect.gen(function* () {
        const service = yield* SeasonService;
        const season = yield* createSeason();

        const config = yield* service.getConfig(SeasonId.make(season.id));

        expect(config.claimingEnabled).toBe(true);
        expect(config.enableAutomaticRefill).toBe(false);
        expect(config.seasonRewardComponentAddress).toBeNull();
        expect(config.adminAccount).toBeNull();
        expect(config.rewardsResourceAddress).toBeNull();
        expect(config.adminBadge).toBeNull();
      }).pipe(Effect.provide(DbService.Default)),
  );

  it.effect(
    'getConfig - returns claimingEnabled true when field is absent from stored config',
    () =>
      Effect.gen(function* () {
        const service = yield* SeasonService;
        const season = yield* createSeason();

        yield* setSeasonConfig(season.id, {
          seasonRewardComponentAddress: null,
        });

        const config = yield* service.getConfig(SeasonId.make(season.id));

        expect(config.claimingEnabled).toBe(true);
      }).pipe(Effect.provide(DbService.Default)),
  );

  it.effect(
    'getConfig - returns claimingEnabled false when explicitly set',
    () =>
      Effect.gen(function* () {
        const service = yield* SeasonService;
        const season = yield* createSeason();

        yield* setSeasonConfig(season.id, { claimingEnabled: false });

        const config = yield* service.getConfig(SeasonId.make(season.id));

        expect(config.claimingEnabled).toBe(false);
      }).pipe(Effect.provide(DbService.Default)),
  );

  it.effect(
    'getConfig - returns claimingEnabled true when explicitly set',
    () =>
      Effect.gen(function* () {
        const service = yield* SeasonService;
        const season = yield* createSeason();

        yield* setSeasonConfig(season.id, { claimingEnabled: true });

        const config = yield* service.getConfig(SeasonId.make(season.id));

        expect(config.claimingEnabled).toBe(true);
      }).pipe(Effect.provide(DbService.Default)),
  );

  it.effect(
    'updateConfig + getConfig - round-trips claimingEnabled correctly',
    () =>
      Effect.gen(function* () {
        const service = yield* SeasonService;
        const season = yield* createSeason();
        const seasonId = SeasonId.make(season.id);

        const originalConfig = yield* service.getConfig(seasonId);
        expect(originalConfig.claimingEnabled).toBe(true);

        yield* service.updateConfig(seasonId, {
          ...originalConfig,
          claimingEnabled: false,
        });

        const updatedConfig = yield* service.getConfig(seasonId);
        expect(updatedConfig.claimingEnabled).toBe(false);

        yield* service.updateConfig(seasonId, {
          ...updatedConfig,
          claimingEnabled: true,
        });

        const restoredConfig = yield* service.getConfig(seasonId);
        expect(restoredConfig.claimingEnabled).toBe(true);
      }).pipe(Effect.provide(DbService.Default)),
  );

  it.effect('getById - fails with NotFound for non-existent season', () =>
    Effect.gen(function* () {
      const service = yield* SeasonService;

      const result = yield* service
        .getById('00000000-0000-0000-0000-000000000000')
        .pipe(Effect.flip);

      expect(result._tag).toBe('NotFound');
    }).pipe(Effect.provide(DbService.Default)),
  );

  it.effect(
    'claiming guard - getConfig returns claimingEnabled false for completed season with claiming disabled',
    () =>
      Effect.gen(function* () {
        const service = yield* SeasonService;
        const season = yield* createSeason({ status: 'completed' });
        const seasonId = SeasonId.make(season.id);

        yield* service.updateConfig(seasonId, {
          seasonRewardComponentAddress: null,
          adminAccount: null,
          rewardsResourceAddress: null,
          adminBadge: null,
          enableAutomaticRefill: false,
          claimingEnabled: false,
        });

        // Mirrors the router flow: getById then getConfig
        const fetched = yield* service.getById(seasonId);
        expect(fetched.status).toBe('completed');

        const config = yield* service.getConfig(seasonId);
        expect(config.claimingEnabled).toBe(false);
      }).pipe(Effect.provide(DbService.Default)),
  );

  it.effect(
    'isClaimingEnabled flow - returns claimingEnabled from config for existing season',
    () =>
      Effect.gen(function* () {
        const service = yield* SeasonService;
        const season = yield* createSeason({ status: 'completed' });
        const seasonId = SeasonId.make(season.id);

        // Mirrors the isClaimingEnabled endpoint: getById + getConfig
        yield* service.getById(seasonId);
        const config = yield* service.getConfig(seasonId);
        expect(config.claimingEnabled).toBe(true);

        yield* service.updateConfig(seasonId, {
          ...config,
          claimingEnabled: false,
        });

        const updatedConfig = yield* service.getConfig(seasonId);
        expect(updatedConfig.claimingEnabled).toBe(false);
      }).pipe(Effect.provide(DbService.Default)),
  );

  it.effect(
    'isClaimingEnabled flow - getById fails with NotFound for non-existent season before getConfig is reached',
    () =>
      Effect.gen(function* () {
        const service = yield* SeasonService;
        const nonExistentId = '00000000-0000-0000-0000-000000000000';

        // Mirrors the isClaimingEnabled endpoint: getById should fail before getConfig
        const error = yield* service.getById(nonExistentId).pipe(Effect.flip);
        expect(error._tag).toBe('NotFound');
      }).pipe(Effect.provide(DbService.Default)),
  );
});
