import { layer } from '@effect/vitest';
import { accountRecoveryRequests, users } from 'db/incentives';
import { eq } from 'drizzle-orm';
import { Effect, Logger } from 'effect';
import { createAccount } from '../../test-helpers/createAccount';
import { createPersona } from '../../test-helpers/createPersona';
import { createRolaMessage } from '../../test-helpers/createRolaMessage';
import { truncateTables } from '../../test-helpers/truncateTables';
import { UpsertAccountsService } from '../account/upsertAccounts';
import { CreateChallengeService } from '../challenge/createChallenge';
import { DbClientService, dbClientLive } from '../db/dbClient';
import { UpsertUserService } from '../user/upsertUser';
import { AccountRecoveryService } from './accountRecovery';

const testSetup = Effect.gen(function* () {
  const upsertUserService = yield* UpsertUserService;
  const upsertAccountsService = yield* UpsertAccountsService;
  const createChallengeService = yield* CreateChallengeService;
  const db = yield* DbClientService;

  const personaA = yield* createPersona();
  const userA = yield* upsertUserService({
    address: personaA.address,
    label: 'Persona A',
  });

  const accountX = yield* createAccount();
  const accountY = yield* createAccount();
  const accountZ = yield* createAccount();

  yield* upsertAccountsService({
    userId: userA.id,
    accounts: [
      { address: accountX.address, label: 'Account X' },
      { address: accountY.address, label: 'Account Y' },
      { address: accountZ.address, label: 'Account Z' },
    ],
  });

  const personaB = yield* createPersona();
  const userB = yield* upsertUserService({
    address: personaB.address,
    label: 'Persona B',
  });

  const personaC = yield* createPersona();
  const userC = yield* upsertUserService({
    address: personaC.address,
    label: 'Persona C',
  });

  const createRolaProof = (
    account: Effect.Effect.Success<ReturnType<typeof createAccount>>,
  ) =>
    Effect.gen(function* () {
      const challenge = yield* createChallengeService();
      const rolaHash = yield* createRolaMessage(challenge);
      return {
        challenge,
        type: 'account' as const,
        address: account.address,
        label: 'Account X',
        proof: {
          publicKey: account.publicKeyHex,
          signature: account.sign(rolaHash),
          curve: 'curve25519' as const,
        },
      };
    });

  const getAccountRecoveryRequestByUserId = (userId: string) =>
    Effect.promise(() =>
      db
        .select()
        .from(accountRecoveryRequests)
        .where(eq(accountRecoveryRequests.requesterUserId, userId))
        .then((results) => results[0]),
    );

  return {
    userA,
    personaA,
    userB,
    personaB,
    userC,
    personaC,
    accountX,
    accountY,
    accountZ,
    createRolaProof,
    getAccountRecoveryRequestByUserId,
  };
}).pipe(
  Effect.provide(UpsertUserService.Default),
  Effect.provide(UpsertAccountsService.Default),
  Effect.provide(CreateChallengeService.Default),
  Effect.provide(dbClientLive),
);

layer(AccountRecoveryService.Default)('accountRecoveryService', (it) => {
  beforeEach(async () => {
    await truncateTables();
  });

  it.effect('should successfully complete account recovery', () =>
    Effect.gen(function* () {
      const accountRecoveryService = yield* AccountRecoveryService;
      const db = yield* DbClientService;

      const {
        userA,
        userB,
        userC,
        personaB,
        accountX,
        accountY,
        accountZ,
        createRolaProof,
        getAccountRecoveryRequestByUserId,
      } = yield* testSetup;

      // user B starts a recovery request by providing a ROLA proof for account X owned by user A
      yield* accountRecoveryService.startRecovery({
        userId: userB.id,
        rolaProof: yield* createRolaProof(accountX),
      });

      const accountRecoveryRequest = yield* getAccountRecoveryRequestByUserId(
        userB.id,
      );

      expect(accountRecoveryRequest).toHaveProperty('userId', userA.id);
      expect(accountRecoveryRequest).toHaveProperty(
        'requesterUserId',
        userB.id,
      );
      expect(accountRecoveryRequest).toHaveProperty('status', 'pending');

      expect(
        yield* accountRecoveryService.listAccountRecoveryProofs({
          userId: userB.id,
          recoveryRequestId: accountRecoveryRequest.id,
        }),
      ).toEqual([
        {
          accountAddress: accountX.address,
          verified: true,
        },
        {
          accountAddress: accountY.address,
          verified: false,
        },
        {
          accountAddress: accountZ.address,
          verified: false,
        },
      ]);

      // Only the requester should be able to list the account recovery proofs
      expect(
        yield* accountRecoveryService.listAccountRecoveryProofs({
          userId: userC.id,
          recoveryRequestId: accountRecoveryRequest.id,
        }),
      ).toHaveLength(0);

      // user B submits a recovery proof for account Y
      yield* accountRecoveryService.submitRecoveryProof({
        userId: userB.id,
        recoveryRequestId: accountRecoveryRequest.id,
        rolaProof: yield* createRolaProof(accountY),
      });

      expect(
        yield* accountRecoveryService.listAccountRecoveryProofs({
          userId: userB.id,
          recoveryRequestId: accountRecoveryRequest.id,
        }),
      ).toEqual([
        {
          accountAddress: accountX.address,
          verified: true,
        },
        {
          accountAddress: accountY.address,
          verified: true,
        },
        {
          accountAddress: accountZ.address,
          verified: false,
        },
      ]);

      // user B submits a recovery proof for account Z
      yield* accountRecoveryService.submitRecoveryProof({
        userId: userB.id,
        recoveryRequestId: accountRecoveryRequest.id,
        rolaProof: yield* createRolaProof(accountZ),
      });

      // user B completes the recovery request
      yield* accountRecoveryService.completeRecovery({
        userId: userB.id,
        recoveryRequestId: accountRecoveryRequest.id,
      });

      const recoveryRequest = yield* getAccountRecoveryRequestByUserId(
        userB.id,
      );

      expect(recoveryRequest).toHaveProperty('status', 'completed');

      const userAResult = yield* Effect.promise(() =>
        db
          .select()
          .from(users)
          .where(eq(users.id, userA.id))
          .then((results) => results[0]),
      );

      expect(userAResult).toHaveProperty('identityAddress', personaB.address);
    }).pipe(Effect.provide(Logger.pretty), Effect.provide(dbClientLive)),
  );
});
