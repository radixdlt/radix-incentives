import { competitionParticipants, competitions, users } from 'db/incentives';
import { and, count, eq, inArray, isNotNull, isNull } from 'drizzle-orm';
import { Data, DateTime, Effect, flow, Option } from 'effect';
import { head } from 'effect/Array';
import { z } from 'zod';
import { DbService } from '../db/dbClient';
import { WeekService } from '../week/week';
import { DrawCompetitionWinners } from './drawCompetitionWinners';
import { PrepareCompetitionEntries } from './prepareCompetitionEntries';

class MissingEmailAddress extends Data.TaggedError('MissingEmailAddress') {}

class PrizeAlreadyClaimedError extends Data.TaggedError(
  'PrizeAlreadyClaimedError',
) {}

class ParticipantNotWinnerError extends Data.TaggedError(
  'ParticipantNotWinnerError',
) {}

class CompetitionNotFoundError extends Data.TaggedError(
  'CompetitionNotFoundError',
) {}

class CompetitionWinnersAlreadyDrawnError extends Data.TaggedError(
  'CompetitionWinnersAlreadyDrawnError',
) {}

class WeekNotProcessedError extends Data.TaggedError('WeekNotProcessedError')<{
  message: string;
}> {}

class CompetitionEndedError extends Data.TaggedError('CompetitionEndedError') {}

export const CreateCompetitionInputSchema = z.object({
  name: z.string(),
  description: z.string(),
  startDate: z.date(),
  endDate: z.date(),
  prizeCount: z.number(),
  slug: z.string(),
});

export type CreateCompetitionInput = z.infer<
  typeof CreateCompetitionInputSchema
>;

export const AddCompetitionParticipantInputSchema = z.object({
  competitionId: z.string(),
  userId: z.string(),
});

export type AddCompetitionParticipantInput = z.infer<
  typeof AddCompetitionParticipantInputSchema
>;

export const ClaimCompetitionPrizeInputSchema = z.object({
  competitionId: z.string(),
  userId: z.string(),
});

export type ClaimCompetitionPrizeInput = z.infer<
  typeof ClaimCompetitionPrizeInputSchema
>;

export const DrawCompetitionWinnersInputSchema = z.object({
  competitionId: z.string(),
});

export type DrawCompetitionWinnersInput = z.infer<
  typeof DrawCompetitionWinnersInputSchema
>;

export const GetParticipantInputSchema = z.object({
  competitionId: z.string(),
  userId: z.string(),
});

export type GetParticipantInput = z.infer<typeof GetParticipantInputSchema>;

export const GetCompetitionParticipantInputSchema = z.object({
  competitionId: z.string(),
  userId: z.string(),
});

export type GetCompetitionParticipantInput = z.infer<
  typeof GetCompetitionParticipantInputSchema
>;

export const EditCompetitionInputSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  description: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  prizeCount: z.number().optional(),
});
export type EditCompetitionInput = z.infer<typeof EditCompetitionInputSchema>;

export const DeleteCompetitionInputSchema = z.object({
  competitionId: z.string(),
});
export type DeleteCompetitionInput = z.infer<
  typeof DeleteCompetitionInputSchema
>;

export const ListParticipantsInputSchema = z.object({
  competitionId: z.string(),
});
export type ListParticipantsInput = z.infer<typeof ListParticipantsInputSchema>;

export const ListCompetitionWinnersInputSchema = z.object({
  competitionId: z.string(),
});
export type ListCompetitionWinnersInput = z.infer<
  typeof ListCompetitionWinnersInputSchema
>;

export const GetCompetitionByIdInputSchema = z.object({
  id: z.string(),
});
export type GetCompetitionByIdInput = z.infer<
  typeof GetCompetitionByIdInputSchema
>;

export const IsCompetitionParticipantInputSchema = z.object({
  competitionId: z.string(),
  userId: z.string(),
});
export type IsCompetitionParticipantInput = z.infer<
  typeof IsCompetitionParticipantInputSchema
>;

export const ExpireCompetitionParticipantsInputSchema = z.object({
  competitionId: z.string(),
});
export type ExpireCompetitionParticipantsInput = z.infer<
  typeof ExpireCompetitionParticipantsInputSchema
>;

export class CompetitionService extends Effect.Service<CompetitionService>()(
  'CompetitionService',
  {
    dependencies: [
      DbService.Default,
      PrepareCompetitionEntries.Default,
      DrawCompetitionWinners.Default,
      WeekService.Default,
    ],
    effect: Effect.gen(function* () {
      const db = yield* DbService;
      const weekService = yield* WeekService;
      const prepareCompetitionEntries = yield* PrepareCompetitionEntries;
      const drawCompetitionWinners = yield* DrawCompetitionWinners;

      const getCompetition = (competitionId: string) =>
        db
          .use((db) =>
            db
              .select()
              .from(competitions)
              .where(eq(competitions.id, competitionId)),
          )
          .pipe(
            Effect.map(([competition]) => competition),
            Effect.filterOrFail(
              (competition) => !!competition,
              () => new CompetitionNotFoundError(),
            ),
          );

      const addCompetitionWinnersToDb = (input: {
        competitionId: string;
        userIds: string[];
      }) =>
        db.use((db) =>
          db
            .update(competitionParticipants)
            .set({ isWinner: true })
            .where(
              and(
                eq(competitionParticipants.competitionId, input.competitionId),
                inArray(competitionParticipants.userId, input.userIds),
              ),
            ),
        );

      const getClaimedPrizeCount = (competitionId: string) =>
        db
          .use((db) =>
            db
              .select({
                count: count(),
              })
              .from(competitionParticipants)
              .where(
                and(
                  eq(competitionParticipants.competitionId, competitionId),
                  isNotNull(competitionParticipants.claimedAt),
                ),
              ),
          )
          .pipe(
            Effect.map(
              flow(
                head,
                Option.map((result) => result.count),
                Option.getOrElse(() => 0),
              ),
            ),
          );

      const drawWinners = (input: DrawCompetitionWinnersInput) =>
        Effect.gen(function* () {
          const competition = yield* getCompetition(input.competitionId);

          const claimedPrizeCount = yield* getClaimedPrizeCount(competition.id);

          if (claimedPrizeCount === competition.prizeCount)
            return yield* new CompetitionWinnersAlreadyDrawnError();

          const remainingPrizeCount =
            competition.prizeCount - claimedPrizeCount;

          // get the next week after the competition end date
          const nextWeek = yield* DateTime.unsafeFromDate(
            competition.endDate,
          ).pipe(
            DateTime.addDuration('1 week'),
            DateTime.toDate,
            weekService.getByDate,
            // we check if the week has been processed to ensure that the week has ended
            Effect.filterOrFail(
              (week) => week.processed,
              (w) =>
                new WeekNotProcessedError({
                  message: `Week ${w.startDate.toISOString()} - ${w.endDate.toISOString()} has not been processed`,
                }),
            ),
          );

          // TWA XRD holdings in USD are counted as 'tickets' for the competition
          yield* prepareCompetitionEntries({
            competitionId: competition.id,
            weekId: nextWeek.id,
          }).pipe(
            Effect.flatMap((entries) =>
              drawCompetitionWinners({
                entries,
                prizeCount: remainingPrizeCount,
              }),
            ),
            Effect.flatMap((userIds) =>
              addCompetitionWinnersToDb({
                competitionId: competition.id,
                userIds,
              }),
            ),
          );
        });

      const addCompetitionParticipant = (
        input: AddCompetitionParticipantInput,
      ) =>
        Effect.gen(function* () {
          const competition = yield* getCompetition(input.competitionId);

          yield* DateTime.unsafeFromDate(competition.endDate).pipe(
            DateTime.isPast,
            Effect.filterOrFail(
              (isEnded) => !isEnded,
              () => new CompetitionEndedError(),
            ),
          );

          yield* db.use((db) =>
            db.insert(competitionParticipants).values(input),
          );
        });

      return {
        createCompetition: (input: CreateCompetitionInput) =>
          db
            .use((db) =>
              db
                .insert(competitions)
                .values({
                  ...input,
                  startDate: DateTime.unsafeFromDate(input.startDate).pipe(
                    DateTime.startOf('day'),
                    DateTime.toDate,
                  ),
                  endDate: DateTime.unsafeFromDate(input.endDate).pipe(
                    DateTime.endOf('day'),
                    DateTime.toDate,
                  ),
                })
                .returning(),
            )
            .pipe(Effect.map(([competition]) => competition)),
        listCompetitions: () => db.use((db) => db.select().from(competitions)),
        getCompetitionById: (input: GetCompetitionByIdInput) =>
          db
            .use((db) =>
              db
                .select()
                .from(competitions)
                .where(eq(competitions.id, input.id)),
            )
            .pipe(
              Effect.map(([competition]) => competition),
              Effect.filterOrFail(
                (competition) => !!competition,
                () => new CompetitionNotFoundError(),
              ),
            ),
        isCompetitionParticipant: (input: IsCompetitionParticipantInput) =>
          db
            .use((db) =>
              db
                .select()
                .from(competitionParticipants)
                .where(
                  and(
                    eq(
                      competitionParticipants.competitionId,
                      input.competitionId,
                    ),
                    eq(competitionParticipants.userId, input.userId),
                  ),
                ),
            )
            .pipe(Effect.map((result) => !!result[0])),
        getCompetitionBySlug: (slug: string) =>
          db
            .use((db) =>
              db.select().from(competitions).where(eq(competitions.slug, slug)),
            )
            .pipe(
              Effect.map(([competition]) => competition),
              Effect.filterOrFail(
                (competition) => !!competition,
                () => new CompetitionNotFoundError(),
              ),
            ),
        editCompetition: (input: EditCompetitionInput) =>
          db.use((db) =>
            db
              .update(competitions)
              .set(input)
              .where(eq(competitions.id, input.id)),
          ),
        deleteCompetition: (input: DeleteCompetitionInput) =>
          db.use((db) =>
            db
              .delete(competitions)
              .where(eq(competitions.id, input.competitionId)),
          ),
        addCompetitionParticipant,
        claimCompetitionPrize: ({
          competitionId,
          userId,
        }: ClaimCompetitionPrizeInput) =>
          db
            .use((db) =>
              Promise.all([
                db
                  .select({
                    email: users.email,
                  })
                  .from(users)
                  .where(eq(users.id, userId)),
                db
                  .select({
                    claimedAt: competitionParticipants.claimedAt,
                  })
                  .from(competitionParticipants)
                  .where(
                    and(
                      eq(competitionParticipants.competitionId, competitionId),
                      eq(competitionParticipants.userId, userId),
                      eq(competitionParticipants.isWinner, true),
                      eq(competitionParticipants.expired, false),
                    ),
                  ),
              ]),
            )
            .pipe(
              Effect.filterOrFail(
                ([result]) => !!result[0]?.email,
                () => new MissingEmailAddress(),
              ),
              Effect.filterOrFail(
                ([, competitionWinner]) => !!competitionWinner[0],
                () => new ParticipantNotWinnerError(),
              ),
              Effect.filterOrFail(
                ([, competitionWinner]) => !competitionWinner[0]?.claimedAt,
                () => new PrizeAlreadyClaimedError(),
              ),
              Effect.flatMap(() =>
                db.use((db) =>
                  db
                    .update(competitionParticipants)
                    .set({ claimedAt: new Date() })
                    .where(
                      and(
                        eq(
                          competitionParticipants.competitionId,
                          competitionId,
                        ),
                        eq(competitionParticipants.userId, userId),
                      ),
                    ),
                ),
              ),
            ),
        drawCompetitionWinners: drawWinners,
        listParticipants: (input: ListParticipantsInput) =>
          db.use((db) =>
            db
              .select()
              .from(competitionParticipants)
              .where(
                eq(competitionParticipants.competitionId, input.competitionId),
              ),
          ),
        listCompetitionWinners: (input: ListCompetitionWinnersInput) =>
          db.use((db) =>
            db
              .select()
              .from(competitionParticipants)
              .where(
                and(
                  eq(
                    competitionParticipants.competitionId,
                    input.competitionId,
                  ),
                  eq(competitionParticipants.isWinner, true),
                  eq(competitionParticipants.expired, false),
                ),
              ),
          ),
        getCompetitionParticipant: (input: GetCompetitionParticipantInput) =>
          db
            .use((db) =>
              db
                .select()
                .from(competitionParticipants)
                .where(
                  and(
                    eq(
                      competitionParticipants.competitionId,
                      input.competitionId,
                    ),
                    eq(competitionParticipants.userId, input.userId),
                  ),
                ),
            )
            .pipe(Effect.map((result) => result[0])),
        expireCompetitionParticipants: (
          input: ExpireCompetitionParticipantsInput,
        ) =>
          db.use((db) =>
            db
              .update(competitionParticipants)
              .set({ expired: true })
              .where(
                and(
                  eq(
                    competitionParticipants.competitionId,
                    input.competitionId,
                  ),
                  isNull(competitionParticipants.claimedAt),
                  eq(competitionParticipants.isWinner, true),
                ),
              ),
          ),
      };
    }),
  },
) {}
