import type { Db } from "db";
import { type AppConfig, createAppConfigLive } from "../services/appConfig";
import { createDbClientLive } from "../services";
import { LoggerLive } from "../services/logger";
import { Effect, Layer } from "effect";
import { RolaServiceLive } from "../services/rola";
import {
  CreateChallengeLive,
  createChallengeProgram,
} from "../challenge/createChallenge";
import { VerifyRolaProofLive } from "../rola/verifyRolaProof";
import {
  signInWithRolaProof,
  type SignInWithRolaProofInput,
} from "../programs/signInWithRolaProof";
import { GenerateSessionTokenLive } from "../session/generateSessionToken";
import { CreateSessionLive } from "../session/createSession";
import { VerifyChallengeLive } from "../challenge/verifyChallenge";
import { UpsertUserLive } from "../user/upsertUser";
import { validateSessionTokenProgram } from "../programs/validateSessionToken";
import { InvalidateSessionLive } from "../session/invalidateSession";
import {
  verifyAccountOwnershipProgram,
  type VerifyAccountOwnershipInput,
} from "../programs/verifyAccountOwnership";
import { UpsertAccountsLive } from "../account/upsertAccounts";
import { GetSessionLive } from "../session/getSession";
import { getAccountsProgram } from "../programs/getAccounts";
import { signOutProgram } from "../programs/signOutProgram";

export type DependencyLayer = ReturnType<typeof createDependencyLayer>;

export type CreateDependencyLayerInput = {
  dbClient: Db;
  appConfig?: AppConfig;
};

export const createDependencyLayer = (input: CreateDependencyLayerInput) => {
  const dbClientLive = createDbClientLive(input.dbClient);
  const appConfigLive = createAppConfigLive(input.appConfig);

  const loggerLive = LoggerLive.pipe(Layer.provide(appConfigLive));

  const rolaServiceLive = RolaServiceLive.pipe(Layer.provide(appConfigLive));

  const createChallengeLive = CreateChallengeLive.pipe(
    Layer.provide(dbClientLive)
  );

  const upsertUserLive = UpsertUserLive.pipe(Layer.provide(dbClientLive));

  const generateSessionTokenLive = GenerateSessionTokenLive;

  const verifyChallengeLive = VerifyChallengeLive.pipe(
    Layer.provide(dbClientLive),
    Layer.provide(appConfigLive)
  );

  const createSessionLive = CreateSessionLive.pipe(
    Layer.provide(dbClientLive),
    Layer.provide(appConfigLive)
  );

  const verifyRolaProofLive = VerifyRolaProofLive.pipe(
    Layer.provide(loggerLive),
    Layer.provide(rolaServiceLive)
  );

  const invalidateSessionLive = InvalidateSessionLive.pipe(
    Layer.provide(dbClientLive)
  );

  const upsertAccountsLive = UpsertAccountsLive.pipe(
    Layer.provide(dbClientLive)
  );

  const getSessionLive = GetSessionLive.pipe(Layer.provide(dbClientLive));

  const createChallenge = () =>
    Effect.runPromiseExit(
      createChallengeProgram.pipe(Effect.provide(createChallengeLive))
    );

  const signIn = (input: SignInWithRolaProofInput) => {
    const program = Effect.provide(
      signInWithRolaProof(input),
      Layer.mergeAll(
        rolaServiceLive,
        loggerLive,
        appConfigLive,
        dbClientLive,
        verifyRolaProofLive,
        createSessionLive,
        generateSessionTokenLive,
        upsertUserLive,
        verifyChallengeLive
      )
    );

    return Effect.runPromiseExit(program);
  };

  const validateSessionToken = (sessionToken: string) => {
    const program = Effect.provide(
      validateSessionTokenProgram(sessionToken),
      Layer.mergeAll(
        getSessionLive,
        invalidateSessionLive,
        dbClientLive,
        appConfigLive,
        loggerLive
      )
    );

    return Effect.runPromiseExit(program);
  };

  const verifyAccountOwnership = (input: VerifyAccountOwnershipInput) => {
    const program = Effect.provide(
      verifyAccountOwnershipProgram(input),
      Layer.mergeAll(
        rolaServiceLive,
        loggerLive,
        appConfigLive,
        dbClientLive,
        verifyRolaProofLive,
        verifyChallengeLive,
        upsertAccountsLive
      )
    );

    return Effect.runPromiseExit(program);
  };

  const getAccounts = (userId: string) => {
    const program = Effect.provide(
      getAccountsProgram(userId),
      Layer.mergeAll(dbClientLive)
    );

    return Effect.runPromiseExit(program);
  };

  const signOut = (userId: string) => {
    const program = Effect.provide(
      signOutProgram(userId),
      Layer.mergeAll(dbClientLive)
    );

    return Effect.runPromiseExit(program);
  };

  return {
    createChallenge,
    signIn,
    validateSessionToken,
    verifyAccountOwnership,
    getAccounts,
    signOut,
  };
};
