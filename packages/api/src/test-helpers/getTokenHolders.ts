import { Effect } from 'effect';
import { GetResourceHoldersService } from '../common/gateway';

export const getTokenHolders = (resourceAddress: string) =>
  Effect.gen(function* () {
    const getResourceHoldersService = yield* GetResourceHoldersService;
    return yield* getResourceHoldersService({
      resourceAddress,
    });
  }).pipe(Effect.provide(GetResourceHoldersService.Default));
