import { Data, Effect } from 'effect';
import { z } from 'zod';
import { CheckAccountPersistenceService } from '../../common/gateway/checkAccountPersistence';
import { CheckAndReactivateAccountsService } from '../account/checkAndReactivateAccounts';
import { GetAccountsByAddressService } from '../account/getAccountsByAddress';
import { UpsertAccountsService } from '../account/upsertAccounts';
import { VerifyChallengeService } from '../challenge/verifyChallenge';
import { VerifyRolaProofService } from '../rola/verifyRolaProof';

export class AccountAlreadyRegisteredError extends Data.TaggedError(
  'AccountAlreadyRegisteredError',
)<{
  message: string;
}> {}

export const verifyAccountOwnershipInputSchema = z.object({
  userId: z.string(),
  challenge: z.string(),
  items: z.array(
    z.object({
      type: z.enum(['account']),
      address: z.string(),
      label: z.string(),
      proof: z.object({
        publicKey: z.string(),
        signature: z.string(),
        curve: z.enum(['curve25519', 'secp256k1']),
      }),
    }),
  ),
});

export type VerifyAccountOwnershipInput = z.infer<
  typeof verifyAccountOwnershipInputSchema
>;

export class VerifyAccountOwnershipService extends Effect.Service<VerifyAccountOwnershipService>()(
  'VerifyAccountOwnershipService',
  {
    dependencies: [
      VerifyRolaProofService.Default,
      UpsertAccountsService.Default,
      GetAccountsByAddressService.Default,
      CheckAccountPersistenceService.Default,
      CheckAndReactivateAccountsService.Default,
    ],
    effect: Effect.gen(function* () {
      const verifyChallenge = yield* VerifyChallengeService;
      const verifyProofService = yield* VerifyRolaProofService;
      const upsertAccounts = yield* UpsertAccountsService;
      const getAccountsByAddress = yield* GetAccountsByAddressService;
      const checkAccountPersistence = yield* CheckAccountPersistenceService;
      const checkAndReactivateAccounts =
        yield* CheckAndReactivateAccountsService;

      return Effect.fnUntraced(function* (input: VerifyAccountOwnershipInput) {
        yield* verifyChallenge(input.challenge);

        yield* verifyProofService.verifyProofs({
          challenge: input.challenge,
          items: input.items,
        });

        const addresses = input.items.map((item) => item.address);

        // Check if any accounts are virtual (not persisted on-ledger)
        yield* checkAccountPersistence(addresses);

        const existingAccounts = yield* getAccountsByAddress({
          addresses,
        });

        const existingAccountAddresses = existingAccounts.map(
          (account) => account.address,
        );

        // Filter out accounts that are already registered
        const remainingAccounts = input.items.filter(
          (item) => !existingAccountAddresses.includes(item.address),
        );

        // If all accounts are already registered, fail
        if (existingAccounts.length > 0 && remainingAccounts.length === 0) {
          return yield* Effect.fail(
            new AccountAlreadyRegisteredError({
              message: `accounts with addresses ${existingAccountAddresses.join(
                ', ',
              )} already registered`,
            }),
          );
        }

        // Upsert remaining accounts
        const accounts = yield* upsertAccounts({
          userId: input.userId,
          accounts: remainingAccounts,
        });

        // Check if user's total XRD balance now meets threshold and reactivate if needed
        yield* checkAndReactivateAccounts({ userId: input.userId });

        return accounts;
      });
    }),
  },
) {}
