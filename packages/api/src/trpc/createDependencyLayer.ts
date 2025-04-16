import type { Db } from "db";
import {
  type AppConfig,
  createAppConfigLive,
} from "../effect/services/appConfig";
import { createDbClientLive } from "../effect";
import { LoggerLive } from "../effect/services/logger";
import { Effect, Layer } from "effect";
import { GatewayApiClientLive } from "../effect/services/gatewayApiClient";
import { RolaServiceLive } from "../effect/services/rola";
import {
  CreateChallengeLive,
  createChallengeProgram,
} from "../auth/challenge/createChallenge";
import {
  type VerifyRolaProofInput,
  VerifyRolaProofLive,
} from "../auth/rola/verifyRolaProof";
import { signInWithRolaProof } from "../auth/programs/signInWithRolaProof";
import { GenerateSessionTokenLive } from "../auth/session/generateSessionToken";
import { CreateSessionLive } from "../auth/session/createSession";
import { VerifyChallengeLive } from "../auth/challenge/verifyChallenge";
import { UpsertUserLive } from "../auth/user/upsertUser";

export type DependencyLayer = ReturnType<typeof createDependencyLayer>;

export type CreateDependencyLayerInput = {
  dbClient: Db;
  appConfig?: AppConfig;
};

export const createDependencyLayer = (input: CreateDependencyLayerInput) => {
  const dbClientLive = createDbClientLive(input.dbClient);
  const appConfigLive = createAppConfigLive(input.appConfig);

  const loggerLive = LoggerLive.pipe(Layer.provide(appConfigLive));

  const gatewayApiClientLive = GatewayApiClientLive.pipe(
    Layer.provide(appConfigLive)
  );

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

  const createChallenge = () =>
    Effect.runPromiseExit(
      createChallengeProgram.pipe(Effect.provide(createChallengeLive))
    );

  const signIn = (input: VerifyRolaProofInput) => {
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

  return {
    createChallenge,
    signIn,
  };
};
