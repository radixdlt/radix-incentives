import { layer } from '@effect/vitest';
import { ActivityId } from 'data';
import {
  accountBalances,
  accounts,
  competitionParticipants,
  competitions,
  seasons,
  users,
  weeks,
} from 'db/incentives';
import { DateTime, Effect, flow, Logger, Order, pipe, Ref } from 'effect';
import { range, reverse, sortBy } from 'effect/Array';
import { values } from 'effect/Record';
import { truncateTables } from '../../test-helpers/truncateTables';
import { DbService } from '../db/dbClient';
import { DrawCompetitionWinners } from './drawCompetitionWinners';
import { PrepareCompetitionEntries } from './prepareCompetitionEntries';

const testSetup = Effect.gen(function* () {
  const db = yield* DbService;

  const startOfWeek = DateTime.unsafeNow().pipe(
    DateTime.startOf('week'),
    DateTime.toDate,
  );
  const endOfWeek = DateTime.unsafeNow().pipe(
    DateTime.endOf('week'),
    DateTime.toDate,
  );

  const data = yield* db.use(async (db) => {
    const [season] = await db
      .insert(seasons)
      .values({
        name: 'Test Season',
        status: 'active',
      })
      .returning();

    const [week] = await db
      .insert(weeks)
      .values({
        seasonId: season.id,
        startDate: startOfWeek,
        endDate: endOfWeek,
      })
      .returning();

    const addAccounts = (
      userId: string,
      address: string,
      numberOfAccounts = 1,
    ) =>
      db
        .insert(accounts)
        .values(
          new Array(numberOfAccounts).fill(null).map((_, index) => ({
            userId,
            address: `${address}-account-${index}`,
            label: `${address}-account-${index}`,
          })),
        )
        .returning();

    const usersResult = await db
      .insert(users)
      .values(
        new Array(4).fill(null).map((_, index) => ({
          identityAddress: `user-${index}`,
        })),
      )
      .returning()
      .then((users) =>
        Promise.all(
          users.map(async (user, index) => {
            const accounts = await addAccounts(user.id, `user-${index}`, 3);
            return { ...user, accounts };
          }),
        ),
      );

    const competition = await db
      .insert(competitions)
      .values({
        name: 'Test Competition',
        description: 'Test Competition',
        startDate: startOfWeek,
        endDate: endOfWeek,
        prizeCount: 1,
        slug: 'test-competition',
      })
      .returning()
      .then(([competition]) => competition);

    const participants = await db
      .insert(competitionParticipants)
      .values(
        usersResult.map((user) => ({
          competitionId: competition.id,
          userId: user.id,
        })),
      )
      .returning();

    return {
      season,
      week,
      users: usersResult,
      competition,
      participants,
      startOfWeek,
      endOfWeek,
    };
  });

  const addAccountBalance = (
    input: {
      accountAddress: string;
      timestamp: Date;
      data: {
        activityId: ActivityId;
        usdValue: string;
      }[];
    }[],
  ) => db.use((db) => db.insert(accountBalances).values(input));

  return { data, addAccountBalance };
}).pipe(Effect.provide(DbService.Default));

layer(PrepareCompetitionEntries.Default)(
  'prepareCompetitionParticipants',
  (it) => {
    beforeEach(async () => {
      await truncateTables();
    });
    it.effect('should prepare competition participants', () =>
      Effect.gen(function* () {
        const prepareCompetitionEntries = yield* PrepareCompetitionEntries;
        const drawCompetitionWinners = yield* DrawCompetitionWinners;

        const { data, addAccountBalance } = yield* testSetup;
        const { week, users, competition, startOfWeek, endOfWeek } = data;

        const userA = users[0];
        const userB = users[1];
        const userC = users[2];
        const userD = users[3];

        yield* addAccountBalance([
          {
            accountAddress: userA.accounts[0].address,
            timestamp: startOfWeek,
            data: [
              {
                activityId: ActivityId.ho_xrd,
                usdValue: '600',
              },
              {
                activityId: ActivityId['c9_ho_hsol-xrd'],
                usdValue: '400',
              },
            ],
          },
          {
            accountAddress: userB.accounts[0].address,
            timestamp: startOfWeek,
            data: [
              {
                activityId: ActivityId['c9_ho_early-xrd'],
                usdValue: '100',
              },
            ],
          },
          {
            accountAddress: userC.accounts[0].address,
            timestamp: startOfWeek,
            data: [
              {
                activityId: ActivityId['c9_ho_hsol-xrd'],
                usdValue: '500',
              },
            ],
          },
          {
            accountAddress: userD.accounts[0].address,
            timestamp: DateTime.unsafeFromDate(endOfWeek).pipe(
              DateTime.subtractDuration('1 millis'),
              DateTime.toDate,
            ),
            data: [
              {
                activityId: ActivityId.fl_ho_xrdfusd,
                usdValue: '50',
              },
            ],
          },
        ]);

        const result = yield* prepareCompetitionEntries({
          competitionId: competition.id,
          weekId: week.id,
        });

        expect(result[0]).toHaveProperty('userId', userA.id);
        expect(result[0]).toHaveProperty('tickets', '1000');

        expect(result[1]).toHaveProperty('userId', userB.id);
        expect(result[1]).toHaveProperty('tickets', '100');

        expect(result[2]).toHaveProperty('userId', userC.id);
        expect(result[2]).toHaveProperty('tickets', '500');

        expect(result[3]).toHaveProperty('userId', userD.id);
        expect(result[3]).toHaveProperty('tickets', '50');

        const winnerRef = yield* Ref.make({
          [userA.id]: { wins: 0, name: 'userA' },
          [userB.id]: { wins: 0, name: 'userB' },
          [userC.id]: { wins: 0, name: 'userC' },
          [userD.id]: { wins: 0, name: 'userD' },
        });

        yield* pipe(
          range(1, 100_000),
          Effect.forEach(
            Effect.fnUntraced(function* () {
              const winners = yield* drawCompetitionWinners({
                entries: result,
                prizeCount: competition.prizeCount,
              });
              for (const winner of winners) {
                yield* Ref.update(winnerRef, (state) => ({
                  ...state,
                  [winner]: {
                    ...state[winner],
                    wins: (state[winner]?.wins ?? 0) + 1,
                  },
                }));
              }
            }),
            { concurrency: 20 },
          ),
        );

        const winners = yield* Ref.get(winnerRef).pipe(
          Effect.map(
            flow(
              values,
              sortBy(Order.mapInput(Order.number, (state) => state.wins)),
              reverse,
            ),
          ),
        );

        expect(winners[0]).toHaveProperty('name', 'userA');
        expect(winners[1]).toHaveProperty('name', 'userC');
        expect(winners[2]).toHaveProperty('name', 'userB');
        expect(winners[3]).toHaveProperty('name', 'userD');
      }).pipe(
        Effect.provide(Logger.pretty),
        Effect.provide(DrawCompetitionWinners.Default),
      ),
    );
  },
);
