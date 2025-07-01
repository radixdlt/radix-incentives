import { Context, Effect, Layer } from "effect";
import { DbClientService, DbError } from "../db/dbClient";
import {
  CalculateActivityPointsService,
  type CalculateActivityPointsError,
} from "./calculateActivityPoints";
import { z } from "zod";
import { InvalidInputError } from "../../common/errors";
import { chunker } from "../../common";
import { accounts } from "db/incentives";
import { lte } from "drizzle-orm";
import { GetWeekByIdService } from "../week/getWeekById";

export const calculateActivityPointsJobSchema = z.object({
  weekId: z.string(),
  addresses: z.array(z.string()).optional(),
});

export type CalculateActivityPointsJob = z.infer<
  typeof calculateActivityPointsJobSchema
>;

export class CalculateActivityPointsWorkerService extends Context.Tag(
  "CalculateActivityPointsWorkerService"
)<
  CalculateActivityPointsWorkerService,
  (
    input: CalculateActivityPointsJob
  ) => Effect.Effect<void, CalculateActivityPointsError | InvalidInputError>
>() {}

export const CalculateActivityPointsWorkerLive = Layer.effect(
  CalculateActivityPointsWorkerService,
  Effect.gen(function* () {
    const db = yield* DbClientService;
    const calculateActivityPointsService =
      yield* CalculateActivityPointsService;
    const getWeekByIdService = yield* GetWeekByIdService;

    return (input) =>
      Effect.gen(function* () {
        const parsedInput = calculateActivityPointsJobSchema.safeParse(input);

        if (!parsedInput.success) {
          return yield* Effect.fail(new InvalidInputError(parsedInput.error));
        }

        const getPaginatedAccountAddresses = ({
          offset = 0,
          limit = 10000,
          createdAt,
        }: {
          weekId: string;
          offset: number;
          limit?: number;
          createdAt: Date;
        }) =>
          Effect.tryPromise({
            try: () =>
              db
                .select({ address: accounts.address })
                .from(accounts)
                .where(lte(accounts.createdAt, createdAt))
                .limit(limit)
                .offset(offset)
                .then((res) => res.map((r) => r.address)),
            catch: (error) => {
              console.error(error);
              return new DbError(error);
            },
          });

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
        const accountsLimitPerPage = process.env.Activity_Points_Worker_Accounts_Limit ? Number.parseInt(process.env.Activity_Points_Worker_Accounts_Limit, 10) : 5000;
        let shouldContinue = true;

        while (shouldContinue) {
          const items = yield* getPaginatedAccountAddresses({
            weekId: parsedInput.data.weekId,
            offset,
            limit: accountsLimitPerPage,
            createdAt: week.endDate,
          });

          if (items.length === 0) {
            shouldContinue = false;
            break;
          }

          yield* calculateActivityPointsService({
            weekId: parsedInput.data.weekId,
            addresses: items,
          });

          offset += accountsLimitPerPage;
        }

        yield* Effect.log(
          `activity points calculations completed for week ${week.id}`
        );
      });
  })
);
