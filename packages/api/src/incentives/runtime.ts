import { type Effect, Layer, ManagedRuntime } from 'effect';
import { CheckAndReactivateAccountsService } from './account/checkAndReactivateAccounts';
import { CompetitionService } from './competition/competition';
import { DappService } from './dapp/dapp';
import { SeasonBonusService } from './season-bonus/seasonBonusService';
import { resolveExit } from './trpc/helpers';
import { UserService } from './user/user';

const layer = Layer.mergeAll(
  CompetitionService.Default,
  UserService.Default,
  CheckAndReactivateAccountsService.Default,
  DappService.Default,
  SeasonBonusService.Default,
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
