import { Context, Effect, Layer } from "effect";
import { DbClientService, DbError } from "../db/dbClient";
import {
    CalculateSPMultiplierService,
    type CalculateSPMultiplierDependency,
    type CalculateSPMultiplierError
} from "./calculateSeasonPointMultiplier";

import { z } from "zod";
import { InvalidInputError } from "../../common/errors";
import { chunker } from "../../common";
import { accounts, users } from "db/incentives";
import { inArray, lte, eq } from "drizzle-orm";
import { GetWeekByIdService } from "../week/getWeekById";

export const seasonPointsMultiplierJobSchema = z.object({
    weekId: z.string(),
    userIds: z.array(z.string()).optional(),
});

export type SeasonPointsMultiplierJob = z.infer<
    typeof seasonPointsMultiplierJobSchema
>;

export class SeasonPointsMultiplierWorkerService extends Context.Tag(
    "SeasonPointsMultiplierWorkerService"
)<
    SeasonPointsMultiplierWorkerService,
    (
        input: SeasonPointsMultiplierJob
    ) => Effect.Effect<
        void,
        CalculateSPMultiplierError | InvalidInputError,
        CalculateSPMultiplierDependency
    >
>() { }

export const SeasonPointsMultiplierWorkerLive = Layer.effect(
    SeasonPointsMultiplierWorkerService,
    Effect.gen(function* () {
        const db = yield* DbClientService;
        const calculateSPMultiplierService = yield* CalculateSPMultiplierService;
        const getWeekByIdService = yield* GetWeekByIdService;

        return (input) =>
            Effect.gen(function* () {
                const parsedInput = seasonPointsMultiplierJobSchema.safeParse(input);
                if (!parsedInput.success) {
                    return yield* Effect.fail(new InvalidInputError(parsedInput.error));
                }

                const week = yield* getWeekByIdService({ id: input.weekId });
                const userIds = parsedInput.data.userIds;

                const getPaginatedUserIds = ({
                    offset = 0,
                    limit = 10000,
                    createdAt,
                }: {
                    weekId: string;
                    offset: number;
                    limit?: number;
                    createdAt: Date;
                }) => Effect.tryPromise({
                    try: () =>
                        db
                            .select({ userId: users.id, address: accounts.address })
                            .from(users)
                            .where(lte(users.createdAt, createdAt))
                            .limit(limit)
                            .offset(offset)
                            .then((res) => res.map((r) => r.userId)),
                    catch: (error) => {
                        console.error(error);
                        return new DbError(error);
                    },
                });

                const getAccountsForUserIds = (userIds: string[]) =>
                    Effect.tryPromise({
                        try: () =>
                            db
                                .select({ address: accounts.address })
                                .from(users)
                                .innerJoin(accounts, eq(users.id, accounts.userId))
                                .where(inArray(users.id, userIds))
                                .then((res) => res.map((r) => ({ address: r.address }))),
                        catch: (error) => {
                            console.error(error);
                            return new DbError(error);
                        },
                    });

                if (userIds) {
                    const addresses = yield* getAccountsForUserIds(userIds);

                    return yield* Effect.forEach(chunker(addresses, 1000), (chunk) =>
                        calculateSPMultiplierService({
                            weekId: input.weekId,
                            addresses: chunk.map((address) => address.address)
                        })
                    );
                }

                let offset = 0;
                const userIdsLimitPerPage = 10_000;
                let shouldContinue = true;

                while (shouldContinue) {
                    const items = yield* getPaginatedUserIds({
                        weekId: input.weekId,
                        offset,
                        limit: userIdsLimitPerPage,
                        createdAt: week.endDate,
                    });

                    if (items.length === 0) {
                        shouldContinue = false;
                        break;
                    }

                    const addresses = yield* getAccountsForUserIds(items);

                    return yield* Effect.forEach(chunker(addresses, 1000), (chunk) =>
                        calculateSPMultiplierService({
                            weekId: input.weekId,
                            addresses: chunk.map((address) => address.address)
                        })
                    );
                }
            });
    })
)

