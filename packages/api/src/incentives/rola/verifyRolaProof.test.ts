import { describe, test, expect } from "vitest";
import { Effect, Layer, Cause, Logger, LogLevel } from "effect";
import { ZodError } from "zod";
import {
  VerifyRolaProofService,
  VerifyRolaProofLive,
  ParseRolaProofInputError,
  VerifyRolaProofError,
  type VerifyRolaProofInput,
} from "./verifyRolaProof";
import { RolaServiceLive } from "./rola";
import { createAppConfigLive, defaultAppConfig } from "../config/appConfig";

// --- Test Data ---

const validInput: VerifyRolaProofInput = {
  challenge: "valid_challenge_string",
  items: [
    {
      type: "persona",
      address:
        "identity_rdx12gcd4r799jpvztlffgw483pqcen98pjnay988n8rmscxf7ukfqcj4w",
      label: "Test Persona",
      proof: {
        publicKey: "ed25519_public_key_mock",
        signature: "ed25519_signature_mock",
        curve: "curve25519",
      },
    },
    {
      type: "account",
      address:
        "account_rdx129a9wuey40lducsf6yu232zmzk5kscpvnl6fv472r0ja39f3hced8u",
      label: "Test Account",
      proof: {
        publicKey: "secp256k1_public_key_mock",
        signature: "secp256k1_signature_mock",
        curve: "secp256k1",
      },
    },
  ],
};

const invalidSchemaInput = {
  challenge: "invalid_challenge",
  items: [
    {
      type: "persona",
      address:
        "identity_rdx12gcd4r799jpvztlffgw483pqcen98pjnay988n8rmscxf7ukfqcj4w",
      // Missing label and proof
    },
  ],
};

const invalidEmptyInput = {
  challenge: "",
  items: [],
};

// --- Real RolaService Setup ---

// Create a layer that sets the log level to None to suppress all logging
const noLoggingLayer = Logger.minimumLogLevel(LogLevel.None);

const appConfigLive = createAppConfigLive(defaultAppConfig);
const rolaServiceLive = RolaServiceLive.pipe(Layer.provide(appConfigLive));
const verifyRolaProofServiceLive = VerifyRolaProofLive.pipe(
  Layer.provide(rolaServiceLive),
  Layer.provide(noLoggingLayer)
);

describe("VerifyRolaProofService", () => {
  test("should validate input schema and process multiple items", async () => {
    const program = Effect.gen(function* () {
      const service = yield* VerifyRolaProofService;
      return yield* service(validInput);
    });

    // Note: This will fail with actual ROLA verification since we're using test data with mock signatures
    // But it should pass the schema validation step
    const result = await Effect.runPromiseExit(
      Effect.provide(program, verifyRolaProofServiceLive)
    );

    // Since we're using test proof data with mock signatures, ROLA verification will fail
    // We expect this to fail at the verification step, not at schema validation
    expect(result._tag).toBe("Failure");

    if (result._tag === "Failure") {
      const failure = Cause.failureOption(result.cause);
      if (failure._tag === "Some") {
        // Should be VerifyRolaProofError, not ParseRolaProofInputError
        expect(failure.value).toBeInstanceOf(VerifyRolaProofError);
        expect(failure.value).not.toBeInstanceOf(ParseRolaProofInputError);
      }
    }
  });

  test("should fail with ParseRolaProofInputError for invalid input schema", async () => {
    const program = Effect.gen(function* () {
      const service = yield* VerifyRolaProofService;
      return yield* service(invalidSchemaInput as VerifyRolaProofInput);
    });

    const result = await Effect.runPromiseExit(
      Effect.provide(program, verifyRolaProofServiceLive)
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
  });

  test("should succeed with empty items array (no items to verify)", async () => {
    const program = Effect.gen(function* () {
      const service = yield* VerifyRolaProofService;
      return yield* service(invalidEmptyInput as VerifyRolaProofInput);
    });

    const result = await Effect.runPromiseExit(
      Effect.provide(program, verifyRolaProofServiceLive)
    );

    expect(result._tag).toBe("Success");
    if (result._tag === "Success") {
      expect(result.value).toBe(true);
    }
  });

  test("should fail with ParseRolaProofInputError for missing challenge", async () => {
    const missingChallengeInput = {
      // Missing challenge field
      items: [
        {
          type: "persona",
          address:
            "identity_rdx12gcd4r799jpvztlffgw483pqcen98pjnay988n8rmscxf7ukfqcj4w",
          label: "Test Persona",
          proof: {
            publicKey: "ed25519_public_key",
            signature: "ed25519_signature",
            curve: "curve25519",
          },
        },
      ],
    };

    const program = Effect.gen(function* () {
      const service = yield* VerifyRolaProofService;
      return yield* service(missingChallengeInput as VerifyRolaProofInput);
    });

    const result = await Effect.runPromiseExit(
      Effect.provide(program, verifyRolaProofServiceLive)
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
  });

  test("should handle different persona and account types", async () => {
    const mixedInput: VerifyRolaProofInput = {
      challenge: "test_challenge",
      items: [
        {
          type: "persona",
          address:
            "identity_rdx12gcd4r799jpvztlffgw483pqcen98pjnay988n8rmscxf7ukfqcj4w",
          label: "Persona Label",
          proof: {
            publicKey: "ed25519_public_key",
            signature: "ed25519_signature",
            curve: "curve25519",
          },
        },
        {
          type: "account",
          address:
            "account_rdx129a9wuey40lducsf6yu232zmzk5kscpvnl6fv472r0ja39f3hced8u",
          label: "Account Label",
          proof: {
            publicKey: "secp256k1_public_key",
            signature: "secp256k1_signature",
            curve: "secp256k1",
          },
        },
      ],
    };

    const program = Effect.gen(function* () {
      const service = yield* VerifyRolaProofService;
      return yield* service(mixedInput);
    });

    const result = await Effect.runPromiseExit(
      Effect.provide(program, verifyRolaProofServiceLive)
    );

    // Should pass schema validation but fail on ROLA verification with test data
    expect(result._tag).toBe("Failure");

    if (result._tag === "Failure") {
      const failure = Cause.failureOption(result.cause);
      if (failure._tag === "Some") {
        // Should be VerifyRolaProofError (ROLA verification failed), not ParseRolaProofInputError
        expect(failure.value).toBeInstanceOf(VerifyRolaProofError);
      }
    }
  });

  test("should validate curve types correctly", async () => {
    const invalidCurveInput = {
      challenge: "test_challenge",
      items: [
        {
          type: "persona",
          address:
            "identity_rdx12gcd4r799jpvztlffgw483pqcen98pjnay988n8rmscxf7ukfqcj4w",
          label: "Test Persona",
          proof: {
            publicKey: "ed25519_public_key",
            signature: "ed25519_signature",
            curve: "invalid_curve", // Invalid curve type
          },
        },
      ],
    };

    const program = Effect.gen(function* () {
      const service = yield* VerifyRolaProofService;
      return yield* service(invalidCurveInput as VerifyRolaProofInput);
    });

    const result = await Effect.runPromiseExit(
      Effect.provide(program, verifyRolaProofServiceLive)
    );

    expect(result._tag).toBe("Failure");
    if (result._tag === "Failure") {
      const failure = Cause.failureOption(result.cause);
      expect(failure._tag).toBe("Some");

      if (failure._tag === "Some") {
        expect(failure.value).toBeInstanceOf(ParseRolaProofInputError);
        const error = (failure.value as ParseRolaProofInputError).error;
        expect(error).toBeInstanceOf(ZodError);

        // Check that the error is specifically about the curve field
        const curveError = error.issues.find((issue) =>
          issue.path.includes("curve")
        );
        expect(curveError).toBeDefined();
      }
    }
  });

  test("should validate address formats", async () => {
    const invalidAddressInput = {
      challenge: "test_challenge",
      items: [
        {
          type: "account",
          address: "invalid_address_format", // Invalid address format
          label: "Test Account",
          proof: {
            publicKey: "secp256k1_public_key",
            signature: "secp256k1_signature",
            curve: "secp256k1",
          },
        },
      ],
    };

    const program = Effect.gen(function* () {
      const service = yield* VerifyRolaProofService;
      return yield* service(invalidAddressInput as VerifyRolaProofInput);
    });

    const result = await Effect.runPromiseExit(
      Effect.provide(program, verifyRolaProofServiceLive)
    );

    // Schema validation should pass (addresses are just strings in the schema)
    // But ROLA verification will fail due to invalid address format
    expect(result._tag).toBe("Failure");

    if (result._tag === "Failure") {
      const failure = Cause.failureOption(result.cause);
      if (failure._tag === "Some") {
        // Should be VerifyRolaProofError since schema validation passes
        expect(failure.value).toBeInstanceOf(VerifyRolaProofError);
      }
    }
  });
});
