import {
  GetTransactionFeesPaginatedLive,
  GetTransactionFeesService,
} from "./getTransactionFees";
import { Effect, Layer } from "effect";
import { createDbClientLive } from "../db/dbClient";
import { db } from "db/incentives";

describe("GetTransactionFeesService", () => {
  it("should get transaction fees", async () => {
    const dbLive = createDbClientLive(db);

    const getTransactionFeesLive = GetTransactionFeesPaginatedLive.pipe(
      Layer.provide(dbLive)
    );

    const program = Effect.gen(function* () {
      const getTransactionFees = yield* GetTransactionFeesService;

      const result = yield* getTransactionFees({
        startTimestamp: new Date("2025-06-01T00:00:00.000Z"),
        endTimestamp: new Date("2025-06-19T00:00:00.000Z"),
      });

      return result;
    });

    const result = await Effect.runPromise(
      Effect.provide(program, Layer.mergeAll(dbLive, getTransactionFeesLive))
    );
  });
});
