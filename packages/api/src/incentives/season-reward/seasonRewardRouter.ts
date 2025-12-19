import { Effect, Schema } from 'effect';
import { HexString, SeasonId, UserId } from 'shared/brandedTypes';
import { AccountProofSchema } from 'shared/schemas/accountProof';
import { Amount } from '../account-balance/v2/schemas';
import { VerifyChallengeService } from '../challenge/verifyChallenge';
import { VerifyRolaProofService } from '../rola/verifyRolaProof';
import { resolveEffect } from '../runtime';
import { SeasonService } from '../season/season';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { effectSchemaParser, ResponseError } from '../trpc/helpers';
import { WorkerApiClient } from '../worker/WorkerApiClient';
import { SeasonRewardService } from './seasonReward';
import { SeasonRewardClaim } from './seasonRewardClaim';

export const seasonRewardRouter = createTRPCRouter({
  requestSeasonRewardClaim: protectedProcedure
    .input(
      effectSchemaParser(
        Schema.Struct({
          amount: Schema.NumberFromString.pipe(
            Schema.greaterThan(0),
            Schema.transform(Schema.String, {
              decode: (n) => String(n),
              encode: (s) => Number(s),
            }),
            Schema.fromBrand(Amount),
          ),
          seasonId: SeasonId,
          proof: AccountProofSchema,
          challenge: HexString,
        }),
      ),
    )
    .mutation(async ({ ctx, input }) =>
      resolveEffect(
        Effect.gen(function* () {
          const challengeService = yield* VerifyChallengeService;
          const verifyProofService = yield* VerifyRolaProofService;
          const workerApiClient = yield* WorkerApiClient;
          const seasonRewardClaim = yield* SeasonRewardClaim;
          const seasonService = yield* SeasonService;
          const season = yield* seasonService.getById(input.seasonId);

          if (season.status !== 'completed') {
            return yield* new ResponseError({
              code: 'BAD_REQUEST',
              message: 'Season is not completed.',
            });
          }

          yield* challengeService.exists(input.challenge);

          yield* verifyProofService.verifyAccountProof({
            challenge: input.challenge,
            proof: input.proof,
          });

          yield* seasonRewardClaim.verifyClaimAmount({
            userId: UserId.make(ctx.session.user.id),
            seasonId: input.seasonId,
            claimAmount: input.amount,
          });

          yield* workerApiClient.seasonRewardClaim({
            userId: UserId.make(ctx.session.user.id),
            seasonId: input.seasonId,
            accountAddress: input.proof.address,
            claimAmount: input.amount,
          });
        }).pipe(
          Effect.catchTags({
            SeasonNotFoundError: () =>
              new ResponseError({
                code: 'BAD_REQUEST',
                message: 'Season not found.',
              }),
            FailedToClaimSeasonRewardError: () =>
              new ResponseError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to claim season reward.',
              }),
            InvalidChallengeError: () =>
              new ResponseError({
                code: 'BAD_REQUEST',
                message:
                  'Provided challenge expired or invalid. Please try again.',
                errorCode: 'INVALID_CHALLENGE',
              }),
            VerifyRolaProofError: () =>
              new ResponseError({
                code: 'BAD_REQUEST',
                message: 'Failed to validate account proof.',
              }),
            InvalidAmountError: (error) =>
              new ResponseError({
                code: 'BAD_REQUEST',
                message: 'message' in error ? error.message : 'Invalid amount.',
              }),
          }),
        ),
      ),
    ),

  getUserSeasonRewards: protectedProcedure.query(({ ctx }) =>
    resolveEffect(
      Effect.gen(function* () {
        const service = yield* SeasonRewardService;
        return yield* service.getUserSeasonRewardsByUser({
          userId: ctx.session.user.id,
        });
      }),
    ),
  ),

  getUserSeasonRewardClaims: protectedProcedure
    .input(effectSchemaParser(Schema.Struct({ seasonId: Schema.String })))
    .query(({ ctx, input }) =>
      resolveEffect(
        Effect.gen(function* () {
          const service = yield* SeasonRewardService;
          return yield* service.getUserSeasonRewardClaims({
            userId: ctx.session.user.id,
            seasonId: input.seasonId,
          });
        }),
      ),
    ),

  getAllUserSeasonRewardClaims: protectedProcedure.query(({ ctx }) =>
    resolveEffect(
      Effect.gen(function* () {
        const service = yield* SeasonRewardService;
        return yield* service.getAllUserSeasonRewardClaims({
          userId: ctx.session.user.id,
        });
      }),
    ),
  ),
});
