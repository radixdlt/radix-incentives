import { Config, Effect, Layer, Logger, ManagedRuntime } from 'effect';
import { CheckAndReactivateAccountsService } from './account/checkAndReactivateAccounts';
import { VerifyChallengeService } from './challenge/verifyChallenge';
import { CompetitionService } from './competition/competition';
import { DappService } from './dapp/dapp';
import { DbService } from './db/dbClient';
import { VerifyRolaProofService } from './rola/verifyRolaProof';
import { SeasonService } from './season/season';
import { SeasonBonusService } from './season-bonus/seasonBonusService';
import { SeasonRewardService } from './season-reward/seasonReward';
import { SeasonRewardClaim } from './season-reward/seasonRewardClaim';
import { resolveExit } from './trpc/helpers';
import { UserService } from './user/user';
import { WorkerApiClient } from './worker/WorkerApiClient';

const loggerLayer = Layer.unwrapEffect(
  Effect.gen(function* () {
    const prettyLogging = yield* Config.boolean('PRETTY_LOGGING').pipe(
      Config.withDefault(false),
    );
    return prettyLogging ? Logger.pretty : Logger.json;
  }),
);

const layer = Layer.mergeAll(
  CompetitionService.Default,
  UserService.Default,
  CheckAndReactivateAccountsService.Default,
  DappService.Default,
  DbService.Default,
  SeasonBonusService.Default,
  VerifyChallengeService.Default,
  VerifyRolaProofService.Default,
  WorkerApiClient.Default,
  SeasonRewardClaim.Default,
  SeasonRewardService.Default,
  SeasonService.Default,
  loggerLayer,
);

export const incentivesRuntime = ManagedRuntime.make(layer);

type Requirements = Effect.Effect.Context<
  Parameters<typeof incentivesRuntime.runPromise>[0]
>;

export const resolveEffect = async <
  A,
  E extends Effect.Effect.Error<any>,
  R extends Requirements,
>(
  effect: Effect.Effect<A, E, R>,
): Promise<A> => incentivesRuntime.runPromiseExit(effect).then(resolveExit);
