import { Effect } from 'effect';
import { ComponentRepo } from '../../../packages/api/src/incentives/component-definition/componentRepo';

const runnable = Effect.gen(function* () {
  const componentRepo = yield* ComponentRepo;

  const input = process.argv[2];

  const result = yield* componentRepo.getByComponentAddresses([input]);

  console.log(JSON.stringify(result, null, 2));
}).pipe(Effect.provide(ComponentRepo.Default));

await Effect.runPromise(runnable);
