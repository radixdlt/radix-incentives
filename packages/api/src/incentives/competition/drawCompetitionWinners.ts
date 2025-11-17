import crypto from 'node:crypto';
import { BigNumber } from 'bignumber.js';
import { Effect, Array as EffectArray, Option, pipe, Random } from 'effect';
import { filter, range } from 'effect/Array';

type CompetitionEntry = {
  userId: string;
  tickets: string;
  cumulativeTickets: string;
};

export class DrawCompetitionWinners extends Effect.Service<DrawCompetitionWinners>()(
  'DrawCompetitionWinners',
  {
    effect: Effect.gen(function* () {
      const selectWinner = (
        pool: CompetitionEntry[],
        randomNumber: BigNumber,
      ): string => {
        // Binary search to find which user owns this ticket number
        let left = 0;
        let right = pool.length - 1;

        while (left < right) {
          const mid = Math.floor((left + right) / 2);

          if (randomNumber.lt(pool[mid]!.cumulativeTickets)) {
            right = mid;
          } else {
            left = mid + 1;
          }
        }

        return pool[left]!.userId;
      };

      const buildCumulativePool = (
        items: {
          userId: string;
          tickets: string;
        }[],
      ) =>
        items.reduce<
          {
            userId: string;
            tickets: string;
            cumulativeTickets: string;
          }[]
        >((acc, item, index) => {
          const previousUser = index > 0 ? acc.at(index - 1) : undefined;

          const tickets = new BigNumber(item.tickets);
          const cumulativeTickets = previousUser
            ? tickets.plus(previousUser.cumulativeTickets)
            : tickets;

          acc.push({
            userId: item.userId,
            tickets: tickets.toString(),
            cumulativeTickets: cumulativeTickets.toString(),
          });
          return acc;
        }, []);

      return (input: {
        entries: { userId: string; tickets: string }[];
        prizeCount: number;
        randomSeed?: string;
      }) =>
        Effect.gen(function* () {
          const randomSeed = input.randomSeed ?? crypto.randomUUID();
          const random = Random.make(randomSeed);

          const winnersSet = new Set<string>();

          for (const _ of range(1, input.prizeCount)) {
            const pool = pipe(
              input.entries,
              filter((entry) => !winnersSet.has(entry.userId)),
              buildCumulativePool,
            );

            if (pool.length === 0) break;

            const totalTickets = pipe(
              EffectArray.last(pool),
              Option.map((last) => new BigNumber(last.cumulativeTickets)),
              Option.getOrThrow,
            );

            const randomNumber = yield* random.nextIntBetween(
              0,
              totalTickets.toNumber() - 1,
            );

            const winnerId = selectWinner(pool, new BigNumber(randomNumber));
            winnersSet.add(winnerId);
          }

          return Array.from(winnersSet.values());
        });
    }),
  },
) {}
