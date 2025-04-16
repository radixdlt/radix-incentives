import { describe, test, expect, vi } from "vitest";
import { Effect, Layer, Cause } from "effect";
import { ZodError } from "zod";
import {
  VerifyRolaProofService,
  VerifyRolaProofLive,
  ParseRolaProofInputError,
  VerifyRolaProofError,
} from "./verifyRolaProof";
import { RolaService } from "../../effect/services/rola";
import { LoggerService } from "../../effect/services/logger";
import type { SignedChallenge } from "@radixdlt/rola";

// --- Mock Services ---

const mockVerifySignedChallenge = vi.fn();
const RolaTest = Layer.succeed(
  RolaService,
  RolaService.of(mockVerifySignedChallenge)
);

// Simplified Logger Mock Layer
// Reverting to 'as any' as MinimalLogger wasn't sufficient and full mock is complex
const mockLoggerError = vi.fn();
const LoggerTest = Layer.succeed(
  LoggerService,
  LoggerService.of({ error: mockLoggerError } as any) // Cast to any to simplify mock
);

// Combine mock layers
const testLayer = Layer.merge(RolaTest, LoggerTest);

// --- Test Data ---

// Input matching the internal signedPersonaChallengeSchema, including label
const validInternalInput = {
  type: "persona",
  challenge: "valid_challenge",
  address: "account_rdx123",
  label: "Test Persona",
  proof: {
    publicKey: "mockPublicKey",
    signature: "mockSignature",
    curve: "curve25519",
  },
};

const invalidSchemaInput = {
  // Missing fields to cause schema validation error
  type: "persona",
  challenge: "invalid_challenge",
};

// Properly typed input missing required fields for schema failure test
const invalidSchemaTypedInput: Partial<SignedChallenge> = {
  type: "persona",
  challenge: "invalid_challenge", // Missing address and proof
};

// --- Mock Results (simulating @radixdlt/result) ---
const mockResultOk = { isOk: () => true, isErr: () => false, value: true };
const verificationError = new Error("Signature verification failed");
const mockResultErr = {
  isOk: () => false,
  isErr: () => true,
  error: verificationError,
};

// --- Test Suite ---

describe("VerifyRolaProofLive", () => {
  // Reset mocks before each test
  beforeEach(() => {
    mockVerifySignedChallenge.mockClear();
    mockLoggerError.mockClear();
  });

  test("should return true for a valid signed challenge", async () => {
    // Mock verifySignedChallenge to return success Result
    mockVerifySignedChallenge.mockResolvedValue(mockResultOk);

    const program = Effect.gen(function* () {
      const service = yield* VerifyRolaProofService;
      return yield* service(validInternalInput as SignedChallenge);
    });

    const result = await Effect.runPromise(
      // @ts-expect-error - Context type mismatch in testing after providing layer
      Effect.provide(
        program,
        VerifyRolaProofLive.pipe(Layer.provide(testLayer))
      )
    );

    expect(result).toBe(true);
    expect(mockVerifySignedChallenge).toHaveBeenCalledWith(
      expect.objectContaining(validInternalInput)
    );
    expect(mockLoggerError).not.toHaveBeenCalled();
  });

  test("should fail with ParseRolaProofInputError for invalid input schema", async () => {
    const program = Effect.gen(function* () {
      const service = yield* VerifyRolaProofService;
      // Pass input that will fail Zod schema validation
      return yield* service(invalidSchemaTypedInput as SignedChallenge); // Cast needed for service call
    });

    const result = await Effect.runPromiseExit(
      // @ts-expect-error - Context type mismatch in testing after providing layer
      Effect.provide(
        program,
        VerifyRolaProofLive.pipe(Layer.provide(testLayer))
      )
    );

    expect(result._tag).toBe("Failure");
    if (result._tag === "Failure") {
      const failure = Cause.failureOption(result.cause);
      expect(failure._tag).toBe("Some");

      if (failure._tag === "Some") {
        expect(failure.value).toBeInstanceOf(ParseRolaProofInputError);
        expect(
          (failure.value as ParseRolaProofInputError).error
        ).toBeInstanceOf(ZodError);
      }
    }
    expect(mockLoggerError).toHaveBeenCalledWith(
      expect.objectContaining({ input: invalidSchemaTypedInput }), // Use the typed invalid input here
      "invalid input"
    );
    expect(mockVerifySignedChallenge).not.toHaveBeenCalled();
  });

  test("should fail with VerifyRolaProofError when RolaService verification fails", async () => {
    // Mock verifySignedChallenge to return an error Result
    mockVerifySignedChallenge.mockResolvedValue(mockResultErr);

    const program = Effect.gen(function* () {
      const service = yield* VerifyRolaProofService;
      return yield* service(validInternalInput as SignedChallenge);
    });

    const result = await Effect.runPromiseExit(
      // @ts-expect-error - Context type mismatch in testing after providing layer
      Effect.provide(
        program,
        VerifyRolaProofLive.pipe(Layer.provide(testLayer))
      )
    );

    expect(result._tag).toBe("Failure");
    if (result._tag === "Failure") {
      const failure = Cause.failureOption(result.cause);
      expect(failure._tag).toBe("Some");
      if (failure._tag === "Some") {
        expect(failure.value).toBeInstanceOf(VerifyRolaProofError);
        expect((failure.value as VerifyRolaProofError).error).toBe(
          verificationError
        );
      }
    }
    expect(mockLoggerError).toHaveBeenCalledWith(
      expect.objectContaining({ input: validInternalInput }),
      "verifySignedChallenge failed"
    );
    expect(mockVerifySignedChallenge).toHaveBeenCalledWith(
      expect.objectContaining(validInternalInput)
    );
  });

  test("should handle unexpected errors during RolaService verification", async () => {
    const unexpectedError = new Error("Unexpected RolaService error");
    // Mock verifySignedChallenge to throw an unexpected error
    mockVerifySignedChallenge.mockRejectedValue(unexpectedError);

    const program = Effect.gen(function* () {
      const service = yield* VerifyRolaProofService;
      return yield* service(validInternalInput as SignedChallenge);
    });

    const result = await Effect.runPromiseExit(
      // @ts-expect-error - Context type mismatch in testing after providing layer
      Effect.provide(
        program,
        VerifyRolaProofLive.pipe(Layer.provide(testLayer))
      )
    );

    expect(result._tag).toBe("Failure");
    // The error should be caught by Effect.tryPromise and wrapped
    if (result._tag === "Failure") {
      // Effect wraps promise rejections in UnknownException, resulting in a Fail cause
      const cause = result.cause;
      expect(Cause.isFailType(cause)).toBe(true); // Correct check for Fail cause type
      // Optional: Further check if the failure is UnknownException if needed
      // const failure = Cause.failureOption(cause)
      // if(failure._tag === 'Some') expect(failure.value).toBeInstanceOf(UnknownException)
    }
  });
});
