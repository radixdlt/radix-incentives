import { Effect } from "effect";
import { CalculateActivityPointsService } from "./calculateActivityPoints";
import { z } from "zod";
import { InvalidInputError } from "../../common/errors";
import { chunker } from "../../common";
import { GetWeekByIdService } from "../week/getWeekById";
import { AccountAddressService } from "../account/accountAddressService";

export const calculateActivityPointsJobSchema = z.object({
  weekId: z.string(),
  addresses: z.array(z.string()).optional(),
  useWeekEndDate: z.boolean().optional().default(false),
});

export type CalculateActivityPointsJob = z.infer<
  typeof calculateActivityPointsJobSchema
>;

export class CalculateActivityPointsWorkerService extends Effect.Service<CalculateActivityPointsWorkerService>()(
  "CalculateActivityPointsWorkerService",
  {
    effect: Effect.gen(function* () {
      const calculateActivityPointsService =
        yield* CalculateActivityPointsService;
      const getWeekByIdService = yield* GetWeekByIdService;
      const accountAddressService = yield* AccountAddressService;
      return {
        run: Effect.fn(function* (input: CalculateActivityPointsJob) {
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
                  useWeekEndDate: parsedInput.data.useWeekEndDate,
                })
            );
          }

          let offset = 0;
          const accountsLimitPerPage = process.env
            .ACTIVITY_POINTS_WORKER_ACCOUNTS_LIMIT
            ? Number.parseInt(
                process.env.ACTIVITY_POINTS_WORKER_ACCOUNTS_LIMIT,
                10
              )
            : 10000;
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

            yield* Effect.log(`fetched ${items.length} accounts`);
            if (items.length === 0) {
              shouldContinue = false;
              break;
            }

            yield* Effect.log(
              `calculating activity points for ${items.length} accounts`
            );
            yield* calculateActivityPointsService({
              weekId: parsedInput.data.weekId,
              addresses: items,
            }).pipe(Effect.withSpan(`calculateActivityPoints-${offset}`));

            offset += accountsLimitPerPage;
            yield* Effect.log(`Progress: ${offset} of accounts processed.`);
          }

          yield* Effect.log(
            `activity points calculations completed for week ${week.id}`
          );
        }),
      };
    }),
  }
) {}

export const CalculateActivityPointsWorkerLive =
  CalculateActivityPointsWorkerService.Default;
