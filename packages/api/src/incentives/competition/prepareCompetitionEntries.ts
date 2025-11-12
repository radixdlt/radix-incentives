import { accounts, competitionParticipants } from 'db/incentives';
import { eq } from 'drizzle-orm';
import { Effect } from 'effect';
import { DbService } from '../db/dbClient';
import { GetUserTWAXrdBalanceService } from '../season-point-multiplier/getUserTWAXrdBalance';

export class PrepareCompetitionEntries extends Effect.Service<PrepareCompetitionEntries>()(
  'PrepareCompetitionEntries',
  {
    dependencies: [GetUserTWAXrdBalanceService.Default, DbService.Default],
    effect: Effect.gen(function* () {
      const getUserTWAXrdBalance = yield* GetUserTWAXrdBalanceService;
      const db = yield* DbService;

      const getParticipantAddresses = (competitionId: string) =>
        db
          .use((db) =>
            db
              .select({
                address: accounts.address,
              })
              .from(competitionParticipants)
              .innerJoin(
                accounts,
                eq(competitionParticipants.userId, accounts.userId),
              )
              .where(eq(competitionParticipants.competitionId, competitionId)),
          )
          .pipe(Effect.map((items) => items.map((item) => item.address)));

      const getTickets = (input: { weekId: string; addresses: string[] }) =>
        getUserTWAXrdBalance(input).pipe(
          Effect.map((items) =>
            items.map((item) => ({
              userId: item.userId,
              tickets: item.totalTWABalance.toString(),
            })),
          ),
        );

      return ({
        competitionId,
        weekId,
      }: {
        competitionId: string;
        weekId: string;
      }) =>
        getParticipantAddresses(competitionId).pipe(
          Effect.flatMap((addresses) => getTickets({ addresses, weekId })),
        );
    }),
  },
) {}
