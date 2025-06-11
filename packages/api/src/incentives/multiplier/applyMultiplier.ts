import { Context, Layer, Effect } from "effect";
import BigNumber from "bignumber.js";

export type ApplyMultiplierInput = {
  userId: string;
  seasonPoints: BigNumber;
}[];

export type ApplyMultiplierOutput = {
  userId: string;
  seasonPoints: BigNumber;
}[];

export type ApplyMultiplierServiceDependencies = never;
export type ApplyMultiplierServiceError = never;

export class ApplyMultiplierService extends Context.Tag(
  "ApplyMultiplierService"
)<
  ApplyMultiplierService,
  (
    input: ApplyMultiplierInput
  ) => Effect.Effect<
    ApplyMultiplierOutput,
    ApplyMultiplierServiceError,
    ApplyMultiplierServiceDependencies
  >
>() {}

export const ApplyMultiplierLive = Layer.effect(
  ApplyMultiplierService,
  Effect.gen(function* () {
    return (input) =>
      Effect.gen(function* () {
        // TODO: Calculate and apply multiplier to season points
        return yield* Effect.forEach(input, (item) => {
          return Effect.gen(function* () {
            return {
              userId: item.userId,
              // TODO: remove hardcoded multiplier
              seasonPoints: item.seasonPoints.multipliedBy(2),
            };
          });
        });
      });
  })
);
