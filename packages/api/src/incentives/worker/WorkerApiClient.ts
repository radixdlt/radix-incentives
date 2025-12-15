import { HttpBody, HttpClient } from '@effect/platform';
import { NodeHttpClient } from '@effect/platform-node';
import { Config, Data, Effect } from 'effect';
import type { SeasonRewardWorkerInput } from '../season-reward/seasonRewardWorker';

export class FailedToClaimSeasonRewardError extends Data.TaggedError(
  'FailedToClaimSeasonRewardError',
)<{
  message: string;
}> {}

export class WorkerApiClient extends Effect.Service<WorkerApiClient>()(
  'WorkerApiClient',
  {
    dependencies: [NodeHttpClient.layer],
    effect: Effect.gen(function* () {
      const httpClient = yield* HttpClient.HttpClient;
      const workerApiUrl = yield* Config.string('WORKERS_API_BASE_URL').pipe(
        Effect.orDie,
      );

      return {
        seasonRewardClaim: (input: SeasonRewardWorkerInput) =>
          Effect.gen(function* () {
            const response = yield* httpClient.post(
              `${workerApiUrl}/queues/season-reward-claim/add`,
              {
                body: yield* HttpBody.json(input),
              },
            );

            if (response.status !== 200)
              return yield* new FailedToClaimSeasonRewardError({
                message: 'Failed to claim season reward',
              });
          }),
      };
    }),
  },
) {}
