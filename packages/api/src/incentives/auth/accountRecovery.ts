import {
  accountRecoveryProofs,
  accountRecoveryRequests,
  accounts,
  sessions,
  users,
} from 'db/incentives';
import { and, count, eq, or } from 'drizzle-orm';
import { Data, Effect } from 'effect';
import { z } from 'zod';
import { GetAccountsByAddressService } from '../account/getAccountsByAddress';
import { VerifyChallengeService } from '../challenge/verifyChallenge';
import { DbClientService, DbError, dbClientLive } from '../db/dbClient';
import { RolaService } from '../rola/rola';
import { type RolaProof, RolaProofSchema } from './schemas';

export const StartRecoveryInput = z.object({
  userId: z.string(),
  rolaProof: RolaProofSchema,
});

export type StartRecoveryInput = z.infer<typeof StartRecoveryInput>;

export const SubmitRecoveryProofInput = z.object({
  userId: z.string(),
  recoveryRequestId: z.string(),
  rolaProof: RolaProofSchema,
});

export type SubmitRecoveryProofInput = z.infer<typeof SubmitRecoveryProofInput>;

export const ListAccountRecoveryProofsInput = z.object({
  userId: z.string(),
  recoveryRequestId: z.string(),
});

export type ListAccountRecoveryProofsInput = z.infer<
  typeof ListAccountRecoveryProofsInput
>;

export const CompleteRecoveryInput = z.object({
  userId: z.string(),
  recoveryRequestId: z.string(),
});

export type CompleteRecoveryInput = z.infer<typeof CompleteRecoveryInput>;

class AccountNotFoundError extends Data.TaggedError('AccountNotFoundError')<{
  message: string;
}> {}

class InvalidRolaProofError extends Data.TaggedError('InvalidRolaProofError')<{
  message: string;
}> {}

class UserNotAllowedToSubmitRecoveryProofError extends Data.TaggedError(
  'UserNotAllowedToSubmitRecoveryProofError',
)<{
  message: string;
}> {}

class AllAccountsNotVerifiedError extends Data.TaggedError(
  'AllAccountsNotVerifiedError',
)<{
  message: string;
}> {}

class RecoveryRequestNotFoundError extends Data.TaggedError(
  'RecoveryRequestNotFoundError',
)<{
  message: string;
}> {}

class RecoveryUserNotEmptyError extends Data.TaggedError(
  'RecoveryUserNotEmptyError',
)<{
  message: string;
}> {}

class AccountRecoveryInProgress extends Data.TaggedError(
  'AccountRecoveryInProgress',
)<{
  message: string;
}> {}

export class AccountRecoveryService extends Effect.Service<AccountRecoveryService>()(
  'AccountRecoveryService',
  {
    dependencies: [
      RolaService.Default,
      dbClientLive,
      GetAccountsByAddressService.Default,
      VerifyChallengeService.Default,
    ],
    effect: Effect.gen(function* () {
      const verifyRolaProof = yield* RolaService;
      const db = yield* DbClientService;
      const getAccountsByAddress = yield* GetAccountsByAddressService;
      const verifyChallenge = yield* VerifyChallengeService;

      const verifyAccountProof = (rolaProof: RolaProof) =>
        Effect.gen(function* () {
          if (rolaProof.type !== 'account') {
            return new InvalidRolaProofError({
              message: `Invalid ROLA proof type: ${rolaProof.type}. Expected 'account'`,
            });
          }

          yield* verifyChallenge.verify(rolaProof.challenge);

          yield* verifyRolaProof(rolaProof);

          yield* getAccountsByAddress({
            addresses: [rolaProof.address],
          }).pipe(
            Effect.filterOrFail(
              (accounts) => accounts.length > 0,
              () => new AccountNotFoundError({ message: 'Account not found' }),
            ),
          );
        });

      const isUserAllowedToSubmitRecoveryProof = (userId: string) =>
        Effect.gen(function* () {
          yield* Effect.tryPromise({
            try: () =>
              db
                .select({ isOwner: count() })
                .from(accountRecoveryRequests)
                .where(eq(accountRecoveryRequests.requesterUserId, userId)),
            catch: (error) => new DbError(error),
          }).pipe(
            Effect.filterOrFail(
              (res) => res[0]!.isOwner > 0,
              () =>
                new UserNotAllowedToSubmitRecoveryProofError({
                  message: 'User not allowed to submit recovery proof',
                }),
            ),
          );
        });

      const listAccountRecoveryProofs = Effect.fnUntraced(function* (input: {
        userId: string;
        recoveryRequestId: string;
      }) {
        const accountRecoveryProofsResult = yield* Effect.tryPromise({
          try: () =>
            db
              .select({
                accountAddress: accountRecoveryProofs.accountAddress,
                userId: accountRecoveryRequests.userId,
              })
              .from(accountRecoveryProofs)
              .innerJoin(
                accountRecoveryRequests,
                eq(
                  accountRecoveryProofs.recoveryRequestId,
                  accountRecoveryRequests.id,
                ),
              )
              .where(
                and(
                  eq(
                    accountRecoveryProofs.recoveryRequestId,
                    input.recoveryRequestId,
                  ),
                  eq(accountRecoveryRequests.requesterUserId, input.userId),
                ),
              ),
          catch: (error) => new DbError(error),
        });

        if (!accountRecoveryProofsResult[0]) {
          return [];
        }

        const userId = accountRecoveryProofsResult[0].userId;

        return yield* Effect.tryPromise({
          try: () =>
            db
              .select({ address: accounts.address })
              .from(accounts)
              .where(eq(accounts.userId, userId)),
          catch: (error) => new DbError(error),
        }).pipe(
          Effect.map((res) =>
            res.map(({ address }) => ({
              accountAddress: address,
              verified: accountRecoveryProofsResult.some(
                (r) => r.accountAddress === address,
              ),
            })),
          ),
        );
      });

      const getAccountsByUserId = (userId: string) =>
        Effect.tryPromise({
          try: () =>
            db
              .select({ address: accounts.address })
              .from(accounts)
              .where(eq(accounts.userId, userId)),
          catch: (error) => new DbError(error),
        });

      const verifyNoConnectedAccounts = (userId: string) =>
        getAccountsByUserId(userId).pipe(
          Effect.filterOrFail(
            (result) => result.length === 0,
            () =>
              new RecoveryUserNotEmptyError({
                message: 'Recovery account has accounts connected',
              }),
          ),
        );

      const getPending = (userId: string) =>
        Effect.tryPromise({
          try: () =>
            db
              .select()
              .from(accountRecoveryRequests)
              .where(
                and(
                  eq(accountRecoveryRequests.requesterUserId, userId),
                  eq(accountRecoveryRequests.status, 'pending'),
                ),
              )
              .limit(1),
          catch: (error) => new DbError(error),
        });

      return {
        startRecovery: Effect.fnUntraced(function* (input: StartRecoveryInput) {
          yield* verifyAccountProof(input.rolaProof);

          yield* verifyNoConnectedAccounts(input.userId);

          yield* getPending(input.userId).pipe(
            Effect.filterOrFail(
              (res) => res.length === 0,
              () =>
                new AccountRecoveryInProgress({
                  message:
                    'Only one account recovery request can be in progress at a time',
                }),
            ),
          );

          const account = yield* getAccountsByAddress({
            addresses: [input.rolaProof.address],
          }).pipe(
            Effect.map(([account]) => account),
            Effect.filterOrFail(
              (account) => !!account,
              () => new AccountNotFoundError({ message: 'Account not found' }),
            ),
          );

          return yield* Effect.tryPromise({
            try: async () => {
              const [result] = await db
                .insert(accountRecoveryRequests)
                .values({
                  userId: account.userId,
                  requesterUserId: input.userId,
                })
                .returning();

              if (!result) {
                throw new Error('Failed to create recovery request');
              }

              await db.insert(accountRecoveryProofs).values({
                recoveryRequestId: result.id,
                accountAddress: account.address,
              });

              return result;
            },
            catch: (error) => new DbError(error),
          });
        }),
        getPending: (userId: string) =>
          getPending(userId).pipe(Effect.map((res) => res[0])),
        listAccountRecoveryProofs: Effect.fnUntraced(function* (
          input: ListAccountRecoveryProofsInput,
        ) {
          const accountRecoveryProofsResult = yield* Effect.tryPromise({
            try: () =>
              db
                .select({
                  accountAddress: accountRecoveryProofs.accountAddress,
                  userId: accountRecoveryRequests.userId,
                })
                .from(accountRecoveryProofs)
                .innerJoin(
                  accountRecoveryRequests,
                  eq(
                    accountRecoveryProofs.recoveryRequestId,
                    accountRecoveryRequests.id,
                  ),
                )
                .where(
                  and(
                    eq(
                      accountRecoveryProofs.recoveryRequestId,
                      input.recoveryRequestId,
                    ),
                    eq(accountRecoveryRequests.requesterUserId, input.userId),
                  ),
                ),
            catch: (error) => new DbError(error),
          });

          if (accountRecoveryProofsResult.length === 0) {
            return [];
          }

          const accountsResult = yield* Effect.tryPromise({
            try: () =>
              db
                .select({ address: accounts.address })
                .from(accounts)
                .where(
                  eq(accounts.userId, accountRecoveryProofsResult[0]!.userId),
                ),
            catch: (error) => new DbError(error),
          });

          return accountsResult.map(({ address }) => ({
            accountAddress: address,
            verified: accountRecoveryProofsResult.some(
              (r) => r.accountAddress === address,
            ),
          }));
        }),
        submitRecoveryProof: Effect.fnUntraced(function* (
          input: SubmitRecoveryProofInput,
        ) {
          yield* verifyAccountProof(input.rolaProof);

          yield* isUserAllowedToSubmitRecoveryProof(input.userId);

          yield* verifyNoConnectedAccounts(input.userId);

          yield* Effect.tryPromise({
            try: () =>
              db.insert(accountRecoveryProofs).values({
                recoveryRequestId: input.recoveryRequestId,
                accountAddress: input.rolaProof.address,
              }),
            catch: (error) => new DbError(error),
          });
        }),
        completeRecovery: Effect.fnUntraced(function* (
          input: CompleteRecoveryInput,
        ) {
          yield* isUserAllowedToSubmitRecoveryProof(input.userId);

          yield* verifyNoConnectedAccounts(input.userId);

          yield* listAccountRecoveryProofs({
            userId: input.userId,
            recoveryRequestId: input.recoveryRequestId,
          }).pipe(
            Effect.filterOrFail(
              (arr) => arr.every((item) => item.verified),
              () =>
                new AllAccountsNotVerifiedError({
                  message: 'All accounts must be verified to complete recovery',
                }),
            ),
          );

          const recoveryRequest = yield* Effect.tryPromise({
            try: () =>
              db
                .select({
                  userId: accountRecoveryRequests.userId,
                  requesterUserId: accountRecoveryRequests.requesterUserId,
                  identityAddress: users.identityAddress,
                })
                .from(accountRecoveryRequests)
                .where(
                  and(
                    eq(accountRecoveryRequests.id, input.recoveryRequestId),
                    eq(accountRecoveryRequests.status, 'pending'),
                  ),
                )
                .innerJoin(
                  users,
                  eq(accountRecoveryRequests.requesterUserId, users.id),
                ),
            catch: (error) => new DbError(error),
          }).pipe(
            Effect.map((result) => result[0]),
            Effect.filterOrFail(
              (result) => !!result,
              () =>
                new RecoveryRequestNotFoundError({
                  message: 'Recovery request not found',
                }),
            ),
          );

          yield* Effect.tryPromise({
            try: () =>
              db.transaction(async (tx) => {
                // update requester identity address to a random UUID
                await tx
                  .update(users)
                  .set({
                    identityAddress: crypto.randomUUID(),
                  })
                  .where(eq(users.id, recoveryRequest.requesterUserId));

                // update user identity address to the recovery request identity address
                await tx
                  .update(users)
                  .set({
                    identityAddress: recoveryRequest.identityAddress,
                  })
                  .where(eq(users.id, recoveryRequest.userId));

                // setting recovery request status to completed
                await tx
                  .update(accountRecoveryRequests)
                  .set({
                    status: 'completed',
                  })
                  .where(
                    eq(accountRecoveryRequests.id, input.recoveryRequestId),
                  );

                // delete all active sessions for the user and the requester
                await tx
                  .delete(sessions)
                  .where(
                    or(
                      eq(sessions.userId, recoveryRequest.userId),
                      eq(sessions.userId, recoveryRequest.requesterUserId),
                    ),
                  );
              }),
            catch: (error) => new DbError(error),
          });
        }),
      };
    }),
  },
) {}
