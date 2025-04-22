import { describe, test, expect, vi } from "vitest";
import { Effect, Layer, Cause } from "effect";
import {
  signInWithRolaProof,
  InvalidProofTypeError,
  InvalidChallengeError,
  InvalidProofError,
} from "./signInWithRolaProof";
import { VerifyRolaProofService } from "../rola/verifyRolaProof";
import { VerifyChallengeService } from "../challenge/verifyChallenge";
import { UpsertUserService } from "../user/upsertUser";
import { CreateSessionService } from "../session/createSession";
import { GenerateSessionTokenService } from "../session/generateSessionToken";
import type { VerifyRolaProofInput } from "../rola/verifyRolaProof";

// --- Mock Services ---

const mockVerifyChallenge = vi.fn();
const VerifyChallengeTest = Layer.succeed(
  VerifyChallengeService,
  VerifyChallengeService.of(mockVerifyChallenge)
);

const mockVerifyProof = vi.fn();
const VerifyRolaProofTest = Layer.succeed(
  VerifyRolaProofService,
  VerifyRolaProofService.of(mockVerifyProof)
);

const mockUpsertUser = vi.fn();
const UpsertUserTest = Layer.succeed(
  UpsertUserService,
  UpsertUserService.of(mockUpsertUser)
);

const mockGenerateSessionToken = vi.fn();
const GenerateSessionTokenTest = Layer.succeed(
  GenerateSessionTokenService,
  GenerateSessionTokenService.of(mockGenerateSessionToken)
);

const mockCreateSession = vi.fn();
const CreateSessionTest = Layer.succeed(
  CreateSessionService,
  CreateSessionService.of(mockCreateSession)
);

// Combine all mock layers
const testLayer = Layer.mergeAll(
  VerifyChallengeTest,
  VerifyRolaProofTest,
  UpsertUserTest,
  GenerateSessionTokenTest,
  CreateSessionTest
);

// --- Test Input ---
// Define a type for the expected proof structure
type RolaProof = VerifyRolaProofInput["proof"];

const validTestInput: VerifyRolaProofInput = {
  type: "persona",
  challenge: "valid_challenge",
  address: "account_address",
  label: "Test User",
  proof: {
    publicKey: "mockPublicKey",
    signature: "mockSignature",
    curve: "curve25519",
  },
};

// Import or define Session type if not already present
// Assuming a structure based on usage
type Session = { id: string; userId: string }; // Define or import Session

// Import error types from the implementation file if not already imported
// Assume other potential errors might come from underlying services if not explicitly handled
// For simplicity in the test assertion, we might broaden the error type or list known ones.
type SignInError =
  | InvalidProofTypeError
  | InvalidChallengeError
  | InvalidProofError
  | Error; // Broaden to include potential underlying errors like DbError, UpsertError etc.

// --- Test Suite ---

describe("signInWithRolaProof", () => {
  test("should successfully sign in with valid proof and challenge", async () => {
    const expectedUserId = "user-123";
    const expectedToken = "session-token-abc";
    const expectedSession = { id: "session-xyz", userId: expectedUserId };

    mockVerifyChallenge.mockReturnValue(Effect.succeed(true));
    mockVerifyProof.mockReturnValue(Effect.succeed(true));
    mockUpsertUser.mockReturnValue(Effect.succeed({ id: expectedUserId }));
    mockGenerateSessionToken.mockReturnValue(expectedToken);
    mockCreateSession.mockReturnValue(Effect.succeed(expectedSession));

    const program = signInWithRolaProof(validTestInput);
    const result = await Effect.runPromise(
      Effect.provide(
        program as unknown as Effect.Effect<
          { session: Session; token: string },
          SignInError,
          never
        >,
        testLayer
      )
    );

    expect(result).toEqual({ session: expectedSession, token: expectedToken });
    expect(mockVerifyChallenge).toHaveBeenCalledWith(validTestInput.challenge);
    expect(mockVerifyProof).toHaveBeenCalledWith(validTestInput);
    expect(mockUpsertUser).toHaveBeenCalledWith({
      address: validTestInput.address,
      label: validTestInput.label,
    });
    expect(mockGenerateSessionToken).toHaveBeenCalled();
    expect(mockCreateSession).toHaveBeenCalledWith({
      token: expectedToken,
      userId: expectedUserId,
    });
  });

  test("should fail with InvalidProofTypeError for non-persona proof type", async () => {
    // Correct the proof structure even for the invalid type test
    const invalidInput = {
      ...validTestInput,
      type: "other" as const,
      proof: {
        publicKey: "mockPublicKey",
        signature: "mockSignature",
        curve: "curve25519",
      } as RolaProof, // Cast needed because base type expects 'persona'
    } as unknown as VerifyRolaProofInput; // Cast needed because type is intentionally wrong

    const program = signInWithRolaProof(invalidInput);
    const result = await Effect.runPromiseExit(
      Effect.provide(
        program as unknown as Effect.Effect<
          { session: Session; token: string },
          SignInError,
          never
        >,
        testLayer
      )
    );

    expect(result._tag).toBe("Failure");
    if (result._tag === "Failure") {
      const failure = Cause.failureOption(result.cause);
      expect(failure._tag).toBe("Some");
      if (failure._tag === "Some") {
        expect(failure.value).toBeInstanceOf(InvalidProofTypeError);
        expect((failure.value as InvalidProofTypeError).proofType).toBe(
          `expected proof type persona, got ${invalidInput.type}`
        );
      }
    }
  });

  test("should fail with InvalidChallengeError when challenge is invalid", async () => {
    mockVerifyChallenge.mockReturnValue(Effect.succeed(false)); // Challenge invalid

    const program = signInWithRolaProof(validTestInput);
    const result = await Effect.runPromiseExit(
      Effect.provide(
        program as unknown as Effect.Effect<
          { session: Session; token: string },
          SignInError,
          never
        >,
        testLayer
      )
    );

    expect(result._tag).toBe("Failure");
    if (result._tag === "Failure") {
      const failure = Cause.failureOption(result.cause);
      expect(failure._tag).toBe("Some");
      if (failure._tag === "Some") {
        expect(failure.value).toBeInstanceOf(InvalidChallengeError);
      }
    }
    expect(mockVerifyChallenge).toHaveBeenCalledWith(validTestInput.challenge);
  });

  test("should fail with InvalidProofError when ROLA proof is invalid", async () => {
    mockVerifyChallenge.mockReturnValue(Effect.succeed(true));
    mockVerifyProof.mockReturnValue(Effect.succeed(false)); // Proof invalid

    const program = signInWithRolaProof(validTestInput);
    const result = await Effect.runPromiseExit(
      Effect.provide(
        program as unknown as Effect.Effect<
          { session: Session; token: string },
          SignInError,
          never
        >,
        testLayer
      )
    );

    expect(result._tag).toBe("Failure");
    if (result._tag === "Failure") {
      const failure = Cause.failureOption(result.cause);
      expect(failure._tag).toBe("Some");
      if (failure._tag === "Some") {
        expect(failure.value).toBeInstanceOf(InvalidProofError);
      }
    }
    expect(mockVerifyChallenge).toHaveBeenCalledWith(validTestInput.challenge);
    expect(mockVerifyProof).toHaveBeenCalledWith(validTestInput);
  });

  test("should propagate errors from upsertUser", async () => {
    const upsertError = new Error("Upsert failed");
    mockVerifyChallenge.mockReturnValue(Effect.succeed(true));
    mockVerifyProof.mockReturnValue(Effect.succeed(true));
    mockUpsertUser.mockReturnValue(Effect.fail(upsertError)); // Upsert fails

    const program = signInWithRolaProof(validTestInput);
    const result = await Effect.runPromiseExit(
      Effect.provide(
        program as unknown as Effect.Effect<
          { session: Session; token: string },
          SignInError,
          never
        >,
        testLayer
      )
    );

    expect(result._tag).toBe("Failure");
    if (result._tag === "Failure") {
      const failure = Cause.failureOption(result.cause);
      expect(failure._tag).toBe("Some");
      if (failure._tag === "Some") {
        expect(failure.value).toBe(upsertError);
      }
    }
  });

  test("should propagate errors from createSession", async () => {
    const createSessionError = new Error("Session creation failed");
    const expectedUserId = "user-123";
    const expectedToken = "session-token-abc";

    mockVerifyChallenge.mockReturnValue(Effect.succeed(true));
    mockVerifyProof.mockReturnValue(Effect.succeed(true));
    mockUpsertUser.mockReturnValue(Effect.succeed({ id: expectedUserId }));
    mockGenerateSessionToken.mockReturnValue(expectedToken);
    mockCreateSession.mockReturnValue(Effect.fail(createSessionError)); // Session creation fails

    const program = signInWithRolaProof(validTestInput);
    const result = await Effect.runPromiseExit(
      Effect.provide(
        program as unknown as Effect.Effect<
          { session: Session; token: string },
          SignInError,
          never
        >,
        testLayer
      )
    );

    expect(result._tag).toBe("Failure");
    if (result._tag === "Failure") {
      const failure = Cause.failureOption(result.cause);
      expect(failure._tag).toBe("Some");
      if (failure._tag === "Some") {
        expect(failure.value).toBe(createSessionError);
      }
    }
  });
});
