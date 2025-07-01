import { Context, Effect, Layer } from "effect";
import { DbClientService, type DbError } from "../db/dbClient";
import {
  CalculateActivityPointsService,
  type CalculateActivityPointsError,
} from "./calculateActivityPoints";
import { z } from "zod";
import { InvalidInputError } from "../../common/errors";
import { chunker } from "../../common";
import { GetWeekByIdService } from "../week/getWeekById";
import { AccountAddressService } from "../account/accountAddressService";

export const calculateActivityPointsJobSchema = z.object({
  weekId: z.string(),
  addresses: z.array(z.string()).optional(),
});

export type CalculateActivityPointsJob = z.infer<
  typeof calculateActivityPointsJobSchema
>;

export type CalculateActivityPointsWorkerError =
  | CalculateActivityPointsError
  | InvalidInputError
  | DbError;

export class CalculateActivityPointsWorkerService extends Context.Tag(
  "CalculateActivityPointsWorkerService"
)<
  CalculateActivityPointsWorkerService,
  (
    input: CalculateActivityPointsJob
  ) => Effect.Effect<void, CalculateActivityPointsWorkerError>
>() {}

export const CalculateActivityPointsWorkerLive = Layer.effect(
  CalculateActivityPointsWorkerService,
  Effect.gen(function* () {
    const calculateActivityPointsService =
      yield* CalculateActivityPointsService;
    const getWeekByIdService = yield* GetWeekByIdService;
    const accountAddressService = yield* AccountAddressService;

    return (input) =>
      Effect.gen(function* () {
        const parsedInput = calculateActivityPointsJobSchema.safeParse(input);

        if (!parsedInput.success) {
          return yield* Effect.fail(new InvalidInputError(parsedInput.error));
        }

        const accountAddresses = parsedInput.data.addresses;

        const week = yield* getWeekByIdService({
          id: parsedInput.data.weekId,
        });

        yield* Effect.log(`calculating activity points for week ${week.id}`, {
          weekId: week.id,
          startDate: week.startDate,
          endDate: week.endDate,
        });

        if (accountAddresses) {
          return yield* Effect.forEach(
            chunker(accountAddresses, 1000),
            (chunk) =>
              calculateActivityPointsService({
                weekId: parsedInput.data.weekId,
                addresses: chunk,
              })
          );
        }

        let offset = 0;
        const accountsLimitPerPage = process.env.ACTIVITY_POINTS_WORKER_ACCOUNTS_LIMIT ? Number.parseInt(process.env.ACTIVITY_POINTS_WORKER_ACCOUNTS_LIMIT, 10) : 10000;
        let shouldContinue = true;

        while (shouldContinue) {
          const items = yield* accountAddressService
            .getPaginated({
              weekId: parsedInput.data.weekId,
              offset,
              limit: accountsLimitPerPage,
              createdAt: week.endDate,
            })
            .pipe(Effect.withSpan("getPaginatedAccounts"));

          yield* Effect.log(`fetched ${items.length} accounts`)
          if (items.length === 0) {
            shouldContinue = false;
            break;
          }

          yield* Effect.log(`calculating activity points for ${items.length} accounts`)
          yield* calculateActivityPointsService({
            weekId: parsedInput.data.weekId,
            addresses: items,
          }).pipe(Effect.withSpan(`calculateActivityPoints-${offset}`));

          offset += accountsLimitPerPage;
        const progress = ((offset + accountsLimitPerPage) / (offset + items.length)) * 100;
        yield* Effect.log(`Progress: ${progress.toFixed(2)}% of accounts processed.`);
        
        }

        yield* Effect.log(
          `activity points calculations completed for week ${week.id}`
        );
      });
  })
);
