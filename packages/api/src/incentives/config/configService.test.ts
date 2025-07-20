import { describe, expect, vi, inject, beforeEach } from "vitest";
import { Effect, Layer, ConfigProvider } from "effect";
import { it } from "@effect/vitest";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq } from "drizzle-orm";
import { schema, config } from "db/incentives";
import type { Db } from "db/incentives";
import { ConfigService } from "./configService";
import { DbClientService } from "../db/dbClient";
import { GetLedgerStateService } from "../../common/gateway/getLedgerState";

describe("ConfigService", () => {
  let db: Db;
  let dbLive: Layer.Layer<DbClientService>;

  const createMockGetLedgerStateService = (mockStateVersion = 123456) => {
    return Layer.succeed(
      GetLedgerStateService,
      // @ts-expect-error - Mocking service for testing
      {
        run: vi.fn().mockReturnValue(
          Effect.succeed({
            state_version: mockStateVersion,
            epoch: 1,
            round: 1,
          })
        ),
      }
    );
  };

  beforeEach(async () => {
    const dbUrl = inject("testDbUrl");
    const client = postgres(dbUrl);
    db = drizzle(client, { schema });
    dbLive = Layer.succeed(DbClientService, db);

    // Clean up config table before each test
    await db.delete(config);
  });

  it("should set and get state version", () =>
    Effect.gen(function* () {
      const configService = yield* ConfigService;
      const testStateVersion = 555666;

      yield* configService.setStateVersion(testStateVersion);
      const result = yield* configService.getStateVersion();

      expect(result).toBe(testStateVersion);

      // Verify database state
      const savedRecord = yield* Effect.promise(() =>
        db.query.config.findFirst({
          where: eq(config.key, "stateVersion"),
        })
      );
      expect(savedRecord?.value).toBe(testStateVersion);
    }).pipe(
      Effect.provide(Layer.merge(dbLive, createMockGetLedgerStateService()))
    ));

  it("should update existing state version", () =>
    Effect.gen(function* () {
      const configService = yield* ConfigService;
      const initialVersion = 100;
      const updatedVersion = 200;

      yield* configService.setStateVersion(initialVersion);
      yield* configService.setStateVersion(updatedVersion);
      const result = yield* configService.getStateVersion();

      expect(result).toBe(updatedVersion);

      // Verify only one record exists
      const allRecords = yield* Effect.promise(() =>
        db.query.config.findMany({
          where: eq(config.key, "stateVersion"),
        })
      );
      expect(allRecords).toHaveLength(1);
      expect(allRecords[0]?.value).toBe(updatedVersion);
    }).pipe(
      Effect.provide(Layer.merge(dbLive, createMockGetLedgerStateService()))
    ));

  it("should handle multiple sequential state version updates", () =>
    Effect.gen(function* () {
      const configService = yield* ConfigService;
      const stateVersions = [100, 200, 300, 400];

      for (const version of stateVersions) {
        yield* configService.setStateVersion(version);
        const retrieved = yield* configService.getStateVersion();
        expect(retrieved).toBe(version);
      }

      // Verify final state in database
      const allRecords = yield* Effect.promise(() =>
        db.query.config.findMany()
      );
      expect(allRecords).toHaveLength(1);
      expect(allRecords[0]?.value).toBe(400);
    }).pipe(
      Effect.provide(Layer.merge(dbLive, createMockGetLedgerStateService()))
    ));

  it("should persist state version across service instances", () =>
    Effect.gen(function* () {
      // Set state version with first service instance
      const configService1 = yield* ConfigService;
      const testStateVersion = 999888;
      yield* configService1.setStateVersion(testStateVersion);

      // Get state version with second service instance
      const configService2 = yield* ConfigService;
      const result = yield* configService2.getStateVersion();

      expect(result).toBe(testStateVersion);
    }).pipe(
      Effect.provide(Layer.merge(dbLive, createMockGetLedgerStateService()))
    ));

  it("should set start state version from provided timestamp", () => {
    const mockStateVersion = 789012;
    const testTimestamp = new Date("2025-01-01T00:00:00Z");

    return Effect.gen(function* () {
      const configService = yield* ConfigService;

      // Call setStartStateVersion with a specific timestamp
      const result = yield* configService.setStartStateVersion(testTimestamp);

      expect(result).toBe(mockStateVersion);

      // Verify the state version was saved to database
      const savedRecord = yield* Effect.promise(() =>
        db.query.config.findFirst({
          where: eq(config.key, "stateVersion"),
        })
      );
      expect(savedRecord?.value).toBe(mockStateVersion);
    }).pipe(
      Effect.provide(
        Layer.merge(dbLive, createMockGetLedgerStateService(mockStateVersion))
      )
    );
  });

  it("should set start state version with current date", () => {
    const mockStateVersion = 456789;
    const currentDate = new Date();

    return Effect.gen(function* () {
      const configService = yield* ConfigService;

      // Call setStartStateVersion with current date
      const result = yield* configService.setStartStateVersion(currentDate);

      expect(result).toBe(mockStateVersion);

      // Verify the state version was saved to database
      const savedRecord = yield* Effect.promise(() =>
        db.query.config.findFirst({
          where: eq(config.key, "stateVersion"),
        })
      );
      expect(savedRecord?.value).toBe(mockStateVersion);
    }).pipe(
      Effect.provide(
        Layer.merge(dbLive, createMockGetLedgerStateService(mockStateVersion))
      )
    );
  });

  it("should return undefined when no state version exists", () =>
    Effect.gen(function* () {
      const configService = yield* ConfigService;

      // Call getStateVersion when no state version exists
      const result = yield* configService.getStateVersion();
      expect(result).toBeUndefined();
    }).pipe(
      Effect.provide(Layer.merge(dbLive, createMockGetLedgerStateService()))
    ));

  it("should use cache for repeated getStateVersion calls", () =>
    Effect.gen(function* () {
      const configService = yield* ConfigService;
      const testStateVersion = 777888;

      // Set state version
      yield* configService.setStateVersion(testStateVersion);

      // Call getStateVersion multiple times
      const result1 = yield* configService.getStateVersion();
      const result2 = yield* configService.getStateVersion();
      const result3 = yield* configService.getStateVersion();

      expect(result1).toBe(testStateVersion);
      expect(result2).toBe(testStateVersion);
      expect(result3).toBe(testStateVersion);
    }).pipe(
      Effect.provide(Layer.merge(dbLive, createMockGetLedgerStateService()))
    ));

  it("should invalidate cache when setting new state version", () =>
    Effect.gen(function* () {
      const configService = yield* ConfigService;
      const initialVersion = 111;
      const updatedVersion = 222;

      // Set initial state version
      yield* configService.setStateVersion(initialVersion);
      const firstResult = yield* configService.getStateVersion();
      expect(firstResult).toBe(initialVersion);

      // Update state version (should invalidate cache)
      yield* configService.setStateVersion(updatedVersion);
      const secondResult = yield* configService.getStateVersion();
      expect(secondResult).toBe(updatedVersion);
    }).pipe(
      Effect.provide(Layer.merge(dbLive, createMockGetLedgerStateService()))
    ));
});
