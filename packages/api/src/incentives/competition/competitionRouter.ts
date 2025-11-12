import { Effect } from 'effect';
import { z } from 'zod';
import { resolveEffect } from '../runtime';
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc';
import { ResponseError } from '../trpc/helpers';
import {
  AddCompetitionParticipantInputSchema,
  ClaimCompetitionPrizeInputSchema,
  CompetitionService,
  CreateCompetitionInputSchema,
  DeleteCompetitionInputSchema,
  DrawCompetitionWinnersInputSchema,
  EditCompetitionInputSchema,
  GetCompetitionByIdInputSchema,
  GetCompetitionParticipantInputSchema,
  IsCompetitionWinnerInputSchema,
  ListCompetitionWinnersInputSchema,
  ListParticipantsInputSchema,
} from './competition';

export const competitionRouter = createTRPCRouter({
  addCompetitionParticipant: protectedProcedure
    .input(AddCompetitionParticipantInputSchema.omit({ userId: true }))
    .mutation(async ({ ctx, input }) =>
      resolveEffect(
        Effect.gen(function* () {
          const competition = yield* CompetitionService;

          yield* competition.addCompetitionParticipant({
            competitionId: input.competitionId,
            userId: ctx.session.user.id,
          });
        }),
      ),
    ),
  listCompetitions: publicProcedure.query(async () =>
    resolveEffect(
      Effect.gen(function* () {
        const competition = yield* CompetitionService;
        return yield* competition.listCompetitions();
      }).pipe(
        Effect.catchTags({
          CompetitionEndedError: () =>
            new ResponseError({
              code: 'FORBIDDEN',
              message: 'Competition has ended',
            }),
        }),
      ),
    ),
  ),
  getCompetitionBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) =>
      resolveEffect(
        Effect.gen(function* () {
          const competition = yield* CompetitionService;
          return yield* competition.getCompetitionBySlug(input.slug);
        }),
      ),
    ),
  isCompetitionWinner: protectedProcedure
    .input(IsCompetitionWinnerInputSchema.omit({ userId: true }))
    .query(async ({ input, ctx }) =>
      resolveEffect(
        Effect.gen(function* () {
          const competition = yield* CompetitionService;
          return yield* competition.isCompetitionWinner({
            competitionId: input.competitionId,
            userId: ctx.session.user.id,
          });
        }),
      ),
    ),
  claimCompetitionPrize: protectedProcedure
    .input(ClaimCompetitionPrizeInputSchema.omit({ userId: true }))
    .mutation(async ({ input, ctx }) =>
      resolveEffect(
        Effect.gen(function* () {
          const competition = yield* CompetitionService;
          yield* competition
            .claimCompetitionPrize({
              competitionId: input.competitionId,
              userId: ctx.session.user.id,
            })
            .pipe(
              Effect.catchTags({
                MissingEmailAddress: () =>
                  new ResponseError({
                    code: 'BAD_REQUEST',
                    message: 'Missing email address',
                  }),
                ParticipantNotWinnerError: () =>
                  new ResponseError({
                    code: 'FORBIDDEN',
                    message: 'User not winner',
                  }),
                PrizeAlreadyClaimedError: () =>
                  new ResponseError({
                    code: 'FORBIDDEN',
                    message: 'Prize already claimed',
                  }),
              }),
            );
        }),
      ),
    ),
  getCompetitionParticipant: protectedProcedure
    .input(GetCompetitionParticipantInputSchema.omit({ userId: true }))
    .query(async ({ input, ctx }) =>
      resolveEffect(
        Effect.gen(function* () {
          const competition = yield* CompetitionService;
          return yield* competition.getCompetitionParticipant({
            competitionId: input.competitionId,
            userId: ctx.session.user.id,
          });
        }),
      ),
    ),
});

export const adminCompetitionRouter = createTRPCRouter({
  createCompetition: publicProcedure
    .input(CreateCompetitionInputSchema)
    .mutation(async ({ input }) =>
      resolveEffect(
        Effect.gen(function* () {
          const competition = yield* CompetitionService;
          return yield* competition.createCompetition(input);
        }),
      ),
    ),
  getCompetitionById: publicProcedure
    .input(GetCompetitionByIdInputSchema)
    .query(async ({ input }) =>
      resolveEffect(
        Effect.gen(function* () {
          const competition = yield* CompetitionService;
          return yield* competition.getCompetitionById(input);
        }),
      ),
    ),
  listCompetitions: publicProcedure.query(async () =>
    resolveEffect(
      Effect.gen(function* () {
        const competition = yield* CompetitionService;
        return yield* competition.listCompetitions();
      }),
    ),
  ),
  editCompetition: publicProcedure
    .input(EditCompetitionInputSchema)
    .mutation(async ({ input }) =>
      resolveEffect(
        Effect.gen(function* () {
          const competition = yield* CompetitionService;
          yield* competition.editCompetition(input);
        }),
      ),
    ),
  deleteCompetition: publicProcedure
    .input(DeleteCompetitionInputSchema)
    .mutation(async ({ input }) =>
      resolveEffect(
        Effect.gen(function* () {
          const competition = yield* CompetitionService;
          yield* competition.deleteCompetition(input);
        }),
      ),
    ),
  drawCompetitionWinners: publicProcedure
    .input(DrawCompetitionWinnersInputSchema)
    .mutation(async ({ input }) =>
      resolveEffect(
        Effect.gen(function* () {
          const competition = yield* CompetitionService;
          yield* competition.drawCompetitionWinners(input).pipe(
            Effect.catchTags({
              CompetitionWinnersAlreadyDrawnError: () =>
                new ResponseError({
                  code: 'FORBIDDEN',
                  message: 'Competition winners already drawn',
                }),
              WeekNotProcessedError: (e) =>
                new ResponseError({
                  code: 'FORBIDDEN',
                  message: e.message,
                }),
              WeekNotFoundError: (error) =>
                new ResponseError({
                  code: 'BAD_REQUEST',
                  message: error.message,
                }),
            }),
          );
        }),
      ),
    ),
  listParticipants: publicProcedure
    .input(ListParticipantsInputSchema)
    .query(async ({ input }) =>
      resolveEffect(
        Effect.gen(function* () {
          const competition = yield* CompetitionService;
          return yield* competition.listParticipants(input);
        }),
      ),
    ),
  listCompetitionWinners: publicProcedure
    .input(ListCompetitionWinnersInputSchema)
    .query(async ({ input }) =>
      resolveEffect(
        Effect.gen(function* () {
          const competition = yield* CompetitionService;
          return yield* competition.listCompetitionWinners(input);
        }),
      ),
    ),
});
