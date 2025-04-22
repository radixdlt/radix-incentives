import { describe, expect, vi, beforeEach } from "vitest";
import { Effect, Layer, Exit, Cause, Option } from "effect";
import { it } from "@effect/vitest";
import { DbClientService, DbError } from "../services/dbClient";
import {
  CreateChallengeLive,
  ChallengeService,
  createChallengeProgram,
} from "./createChallenge";
import { challenge } from "db";

// Mock the Drizzle-like database client behavior
const mockDbClient = {
  insert: vi.fn().mockReturnThis(),
  values: vi.fn().mockReturnThis(),
  returning: vi.fn().mockReturnThis(),
};

// Provide the mocked client via the DbClientService Layer
const mockDbClientService = Layer.succeed(
  DbClientService,
  DbClientService.of(mockDbClient as unknown as DbClientService["Type"])
);

describe("createChallenge", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("CreateChallengeLive Layer", () => {
    it.effect("should provide a challenge string on successful DB insert", () =>
      Effect.gen(function* () {
        const mockChallengeData = { challenge: "test-challenge-123" };
        mockDbClient.returning.mockResolvedValueOnce([mockChallengeData]);

        const testLayer = CreateChallengeLive.pipe(
          Layer.provide(mockDbClientService)
        );

        const challengeServiceValue = yield* Effect.provide(
          ChallengeService,
          testLayer
        );

        expect(challengeServiceValue).toBe("test-challenge-123");
        expect(mockDbClient.insert).toHaveBeenCalledWith(challenge);
        expect(mockDbClient.values).toHaveBeenCalledWith({});
        expect(mockDbClient.returning).toHaveBeenCalled();
      })
    );

    it.effect("should fail with DbError if insert returns no value", () =>
      Effect.gen(function* () {
        mockDbClient.returning.mockResolvedValueOnce([]);

        const testLayer = CreateChallengeLive.pipe(
          Layer.provide(mockDbClientService)
        );

        const exit = yield* Effect.provide(ChallengeService, testLayer).pipe(
          Effect.exit
        );

        expect(Exit.isFailure(exit)).toBe(true);
        if (Exit.isFailure(exit)) {
          const failure = Cause.failureOption(exit.cause);
          expect(Option.isSome(failure)).toBe(true);
          if (Option.isSome(failure)) {
            expect(failure.value).toBeInstanceOf(DbError);
            const dbError = failure.value as DbError;
            expect(dbError.error).toContain("No challenge created");
          }
        }
        expect(mockDbClient.insert).toHaveBeenCalledWith(challenge);
      })
    );

    it.effect("should fail with DbError if DB insert promise rejects", () =>
      Effect.gen(function* () {
        const originalError = new Error("DB connection error");
        mockDbClient.returning.mockRejectedValueOnce(originalError);

        const testLayer = CreateChallengeLive.pipe(
          Layer.provide(mockDbClientService)
        );

        const exit = yield* Effect.provide(ChallengeService, testLayer).pipe(
          Effect.exit
        );

        expect(Exit.isFailure(exit)).toBe(true);
        if (Exit.isFailure(exit)) {
          const failure = Cause.failureOption(exit.cause);
          expect(Option.isSome(failure)).toBe(true);
          if (Option.isSome(failure)) {
            expect(failure.value).toBeInstanceOf(DbError);
            const dbError = failure.value as DbError;
            expect(dbError.error).toBe(originalError);
          }
        }
        expect(mockDbClient.insert).toHaveBeenCalledWith(challenge);
      })
    );
  });

  describe("createChallengeProgram", () => {
    it.effect("should return the challenge provided by ChallengeService", () =>
      Effect.gen(function* () {
        const testChallenge = "mock-challenge-service-result";
        const MockChallengeServiceLayer = Layer.succeed(
          ChallengeService,
          ChallengeService.of(testChallenge)
        );

        const result = yield* Effect.provide(
          createChallengeProgram,
          MockChallengeServiceLayer
        );

        expect(result).toBe(testChallenge);
      })
    );

    it.effect(
      "should work correctly when integrated with CreateChallengeLive",
      () =>
        Effect.gen(function* () {
          const mockChallengeData = { challenge: "integrated-challenge-456" };
          mockDbClient.returning.mockResolvedValueOnce([mockChallengeData]);

          const testLayer = CreateChallengeLive.pipe(
            Layer.provide(mockDbClientService)
          );

          const result = yield* Effect.provide(
            createChallengeProgram,
            testLayer
          );

          expect(result).toBe("integrated-challenge-456");
          expect(mockDbClient.insert).toHaveBeenCalledWith(challenge);
          expect(mockDbClient.values).toHaveBeenCalledWith({});
          expect(mockDbClient.returning).toHaveBeenCalled();
        })
    );
  });
});
