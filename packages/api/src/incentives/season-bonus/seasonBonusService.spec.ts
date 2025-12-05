import { layer } from '@effect/vitest';
import { seasons, users } from 'db/incentives';
import { Effect } from 'effect';
import { beforeEach } from 'vitest';
import { truncateTables } from '../../test-helpers/truncateTables';
import { DbService } from '../db/dbClient';
import { SeasonBonusService } from './seasonBonusService';

const testSetup = Effect.gen(function* () {
  const db = yield* DbService;

  const data = yield* db.use(async (db) => {
    const [user1] = await db
      .insert(users)
      .values({
        identityAddress: 'user-1',
      })
      .returning();

    const [user2] = await db
      .insert(users)
      .values({
        identityAddress: 'user-2',
      })
      .returning();

    const [season1] = await db
      .insert(seasons)
      .values({
        name: 'Test Season 1',
        status: 'active',
      })
      .returning();

    const [season2] = await db
      .insert(seasons)
      .values({
        name: 'Test Season 2',
        status: 'active',
      })
      .returning();

    return {
      user1,
      user2,
      season1,
      season2,
    };
  });

  return data;
}).pipe(Effect.provide(DbService.Default));

layer(SeasonBonusService.Default)('SeasonBonusService', (it) => {
  beforeEach(async () => {
    await truncateTables();
  });

  it.effect('should upload season bonuses and retrieve them', () =>
    Effect.gen(function* () {
      const service = yield* SeasonBonusService;
      const { user1, user2, season1 } = yield* testSetup;

      // Upload season bonuses
      yield* service.uploadCsv([
        {
          userId: user1.id,
          seasonId: season1.id,
          seasonBonus: 0.15,
        },
        {
          userId: user2.id,
          seasonId: season1.id,
          seasonBonus: 0.1,
        },
      ]);

      // Retrieve season bonus for user1
      const bonus1 = yield* service.getSeasonBonus(user1.id, season1.id);
      expect(bonus1).toBe('0.150000');

      // Retrieve season bonus for user2
      const bonus2 = yield* service.getSeasonBonus(user2.id, season1.id);
      expect(bonus2).toBe('0.100000');
    }).pipe(Effect.provide(DbService.Default)),
  );

  it.effect('should return null for non-existent season bonus', () =>
    Effect.gen(function* () {
      const service = yield* SeasonBonusService;
      const { user1, season1 } = yield* testSetup;

      const bonus = yield* service.getSeasonBonus(user1.id, season1.id);
      expect(bonus).toBe(null);
    }).pipe(Effect.provide(DbService.Default)),
  );

  it.effect('should update existing season bonus on conflict', () =>
    Effect.gen(function* () {
      const service = yield* SeasonBonusService;
      const { user1, season1 } = yield* testSetup;

      // Upload initial bonus
      yield* service.uploadCsv([
        {
          userId: user1.id,
          seasonId: season1.id,
          seasonBonus: 0.1,
        },
      ]);

      // Verify initial bonus
      const initialBonus = yield* service.getSeasonBonus(user1.id, season1.id);
      expect(initialBonus).toBe('0.100000');

      // Upload updated bonus
      yield* service.uploadCsv([
        {
          userId: user1.id,
          seasonId: season1.id,
          seasonBonus: 0.2,
        },
      ]);

      // Verify updated bonus
      const updatedBonus = yield* service.getSeasonBonus(user1.id, season1.id);
      expect(updatedBonus).toBe('0.200000');
    }).pipe(Effect.provide(DbService.Default)),
  );

  it.effect('should handle multiple seasons for the same user', () =>
    Effect.gen(function* () {
      const service = yield* SeasonBonusService;
      const { user1, season1, season2 } = yield* testSetup;

      // Upload bonuses for different seasons
      yield* service.uploadCsv([
        {
          userId: user1.id,
          seasonId: season1.id,
          seasonBonus: 0.15,
        },
        {
          userId: user1.id,
          seasonId: season2.id,
          seasonBonus: 0.1,
        },
      ]);

      // Verify bonuses for each season
      const bonus1 = yield* service.getSeasonBonus(user1.id, season1.id);
      expect(bonus1).toBe('0.150000');

      const bonus2 = yield* service.getSeasonBonus(user1.id, season2.id);
      expect(bonus2).toBe('0.100000');
    }).pipe(Effect.provide(DbService.Default)),
  );

  it.effect('should handle batch uploads with upserts', () =>
    Effect.gen(function* () {
      const service = yield* SeasonBonusService;
      const { user1, user2, season1 } = yield* testSetup;

      // Upload initial bonuses
      yield* service.uploadCsv([
        {
          userId: user1.id,
          seasonId: season1.id,
          seasonBonus: 0.1,
        },
        {
          userId: user2.id,
          seasonId: season1.id,
          seasonBonus: 0.05,
        },
      ]);

      // Upload batch with one update and one new entry
      yield* service.uploadCsv([
        {
          userId: user1.id,
          seasonId: season1.id,
          seasonBonus: 0.2, // Update
        },
      ]);

      // Verify updated and unchanged bonuses
      const bonus1 = yield* service.getSeasonBonus(user1.id, season1.id);
      expect(bonus1).toBe('0.200000');

      const bonus2 = yield* service.getSeasonBonus(user2.id, season1.id);
      expect(bonus2).toBe('0.050000');
    }).pipe(Effect.provide(DbService.Default)),
  );

  it.effect('should get correct count of season bonus records', () =>
    Effect.gen(function* () {
      const service = yield* SeasonBonusService;
      const { user1, user2, season1, season2 } = yield* testSetup;

      // Initially count should be 0
      const initialCount = yield* service.getCount();
      expect(initialCount).toBe(0);

      // Upload some bonuses
      yield* service.uploadCsv([
        {
          userId: user1.id,
          seasonId: season1.id,
          seasonBonus: 0.15,
        },
        {
          userId: user2.id,
          seasonId: season1.id,
          seasonBonus: 0.1,
        },
        {
          userId: user1.id,
          seasonId: season2.id,
          seasonBonus: 0.12,
        },
      ]);

      // Count should be 3
      const count = yield* service.getCount();
      expect(count).toBe(3);
    }).pipe(Effect.provide(DbService.Default)),
  );

  it.effect('should handle large batch uploads efficiently', () =>
    Effect.gen(function* () {
      const service = yield* SeasonBonusService;
      const { season1 } = yield* testSetup;
      const db = yield* DbService;

      // Create multiple users for batch testing
      const userCount = 2500;
      const usersData = yield* db.use((db) =>
        db
          .insert(users)
          .values(
            Array.from({ length: userCount }, (_, i) => ({
              identityAddress: `user-batch-${i}`,
            })),
          )
          .returning(),
      );

      // Upload large batch
      const bonuses = usersData.map((user, i) => ({
        userId: user.id,
        seasonId: season1.id,
        seasonBonus: (i % 20) / 100, // 0 to 0.19
      }));

      yield* service.uploadCsv(bonuses);

      // Verify count
      const count = yield* service.getCount();
      expect(count).toBe(userCount);

      // Verify a few random entries
      const bonus1 = yield* service.getSeasonBonus(usersData[0].id, season1.id);
      expect(bonus1).toBe('0.000000');

      const bonus100 = yield* service.getSeasonBonus(
        usersData[100].id,
        season1.id,
      );
      expect(bonus100).toBe('0.000000');

      const bonus999 = yield* service.getSeasonBonus(
        usersData[999].id,
        season1.id,
      );
      expect(bonus999).toBe('0.190000');
    }).pipe(Effect.provide(DbService.Default)),
  );

  it.effect('should handle zero bonus value', () =>
    Effect.gen(function* () {
      const service = yield* SeasonBonusService;
      const { user1, season1 } = yield* testSetup;

      yield* service.uploadCsv([
        {
          userId: user1.id,
          seasonId: season1.id,
          seasonBonus: 0,
        },
      ]);

      const bonus = yield* service.getSeasonBonus(user1.id, season1.id);
      expect(bonus).toBe('0.000000');
    }).pipe(Effect.provide(DbService.Default)),
  );

  it.effect('should handle maximum bonus value (0.2)', () =>
    Effect.gen(function* () {
      const service = yield* SeasonBonusService;
      const { user1, season1 } = yield* testSetup;

      yield* service.uploadCsv([
        {
          userId: user1.id,
          seasonId: season1.id,
          seasonBonus: 0.2,
        },
      ]);

      const bonus = yield* service.getSeasonBonus(user1.id, season1.id);
      expect(bonus).toBe('0.200000');
    }).pipe(Effect.provide(DbService.Default)),
  );

  it.effect('should preserve precision for decimal values', () =>
    Effect.gen(function* () {
      const service = yield* SeasonBonusService;
      const { user1, season1 } = yield* testSetup;

      yield* service.uploadCsv([
        {
          userId: user1.id,
          seasonId: season1.id,
          seasonBonus: 0.14532,
        },
      ]);

      const bonus = yield* service.getSeasonBonus(user1.id, season1.id);
      expect(bonus).toBe('0.145320');
    }).pipe(Effect.provide(DbService.Default)),
  );
});
