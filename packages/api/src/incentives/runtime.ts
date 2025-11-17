import { type Effect, Layer, ManagedRuntime } from 'effect';
import { CompetitionService } from './competition/competition';
import { resolveExit } from './trpc/helpers';
import { UserService } from './user/user';

const layer = Layer.mergeAll(CompetitionService.Default, UserService.Default);

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
