import { describe, test, expect, vi } from "vitest";
import { Effect, Layer, Cause } from "effect";
import { VerifyChallengeService, VerifyChallengeLive } from "./verifyChallenge";
import {
  createDbClientLive,
  DbClientService,
  DbError,
} from "../services/dbClient";
import { AppConfigService, createAppConfigLive } from "../services/appConfig";
import { challenge, type Db } from "db";

// Mock the DbClientService
const mockDbClient = {
  delete: vi.fn(),
};
const DbClientTest = Layer.succeed(DbClientService, {
  // @ts-expect-error - Mocking DB client
  _tag: "DbClientService",
  ...mockDbClient,
});

// Mock the AppConfigService
const mockAppConfig = {
  challengeTTL: 5 * 60 * 1000, // 5 minutes
};
const AppConfigTest = Layer.succeed(AppConfigService, {
  // @ts-expect-error - Mocking AppConfigService
  _tag: "AppConfigService",
  ...mockAppConfig,
});

const appConfigLive = createAppConfigLive();

const dbClientLive = createDbClientLive(mockDbClient as unknown as Db);

const verifyChallengeLive = VerifyChallengeLive.pipe(
  Layer.provide(dbClientLive),
  Layer.provide(appConfigLive)
);

describe("VerifyChallengeLive", () => {
  test("should return true when challenge exists and is not expired", async () => {
    const inputChallenge = "valid_challenge";
    const mockReturningValue = {
      challenge: inputChallenge,
      createdAt: new Date(),
    };

    mockDbClient.delete.mockImplementation(() => ({
      where: vi.fn().mockReturnThis(),
      returning: vi.fn().mockResolvedValue([mockReturningValue]),
    }));

    const program = Effect.gen(function* () {
      const service = yield* VerifyChallengeService;
      return yield* service(inputChallenge);
    });

    const result = await Effect.runPromise(
      Effect.provide(
        program,
        Layer.mergeAll(verifyChallengeLive, DbClientTest, AppConfigTest)
      )
    );

    expect(result).toBe(true);
    expect(mockDbClient.delete).toHaveBeenCalledWith(challenge);
    // More specific checks on the where clause could be added if needed
  });

  test("should return false when challenge does not exist", async () => {
    const inputChallenge = "non_existent_challenge";

    mockDbClient.delete.mockImplementation(() => ({
      where: vi.fn().mockReturnThis(),
      returning: vi.fn().mockResolvedValue([]), // No challenge found
    }));

    const program = Effect.flatMap(VerifyChallengeService, (service) =>
      service(inputChallenge)
    );

    const result = await Effect.runPromise(
      Effect.provide(
        program,
        Layer.mergeAll(verifyChallengeLive, DbClientTest, AppConfigTest)
      )
    );

    expect(result).toBe(false);
    expect(mockDbClient.delete).toHaveBeenCalledWith(challenge);
  });

  test("should return false when challenge exists but is expired", async () => {
    const inputChallenge = "expired_challenge";

    mockDbClient.delete.mockImplementation(() => ({
      where: vi.fn().mockReturnThis(),
      returning: vi.fn().mockResolvedValue([]), // Simulating deletion failing due to expiration (gt condition)
    }));

    const program = Effect.flatMap(VerifyChallengeService, (service) =>
      service(inputChallenge)
    );

    const result = await Effect.runPromise(
      Effect.provide(
        program,
        Layer.mergeAll(verifyChallengeLive, DbClientTest, AppConfigTest)
      )
    );

    expect(result).toBe(false);
    expect(mockDbClient.delete).toHaveBeenCalledWith(challenge);
    // In a real scenario, the DB query itself would return empty because of the GT condition.
    // We simulate this by returning an empty array.
  });

  test("should return DbError when database operation fails", async () => {
    const inputChallenge = "error_challenge";
    const dbError = new Error("Database connection failed");

    mockDbClient.delete.mockImplementation(() => ({
      where: vi.fn().mockReturnThis(),
      returning: vi.fn().mockRejectedValue(dbError),
    }));

    const program = Effect.flatMap(VerifyChallengeService, (service) =>
      service(inputChallenge)
    );

    const result = await Effect.runPromiseExit(
      Effect.provide(
        program,
        Layer.mergeAll(verifyChallengeLive, DbClientTest, AppConfigTest)
      )
    );

    expect(result._tag).toBe("Failure");
    if (result._tag === "Failure") {
      const failure = Cause.failureOption(result.cause);
      expect(failure._tag).toBe("Some");
      if (failure._tag === "Some") {
        expect(failure.value).toBeInstanceOf(DbError);
        expect((failure.value as DbError).error).toBe(dbError);
      }
    }
    expect(mockDbClient.delete).toHaveBeenCalledWith(challenge);
  });
});
