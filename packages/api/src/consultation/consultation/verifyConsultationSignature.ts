import { Effect } from "effect";

import {
  signedChallengeSchema,
  VerifyRolaProofService,
} from "../rola/verifyRolaProof";

import { areUint8ArraysEqual } from "../../common/crypto/areEqual";
import { fromHex } from "radix-connect";
import { AddConsultationToDbService } from "../consultation/addConsultationToDb";
import { z } from "zod";
import { CreateConsultationMessageService } from "../consultation/createConsultationMessage";

export class VerifyConsultationSignatureError {
  readonly _tag = "VerifyConsultationSignatureError";
}

export class InvalidRolaProofError {
  readonly _tag = "InvalidRolaProofError";
}

export const verifyConsultationSignatureInputSchema = z.object({
  consultationId: z.string(),
  selectedOption: z.string(),
  rolaProof: signedChallengeSchema,
});

export type VerifyConsultationSignatureInput = z.infer<
  typeof verifyConsultationSignatureInputSchema
>;

export class VerifyConsultationSignatureService extends Effect.Service<VerifyConsultationSignatureService>()(
  "VerifyConsultationSignatureService",
  {
    effect: Effect.gen(function* () {
      const verifyRolaProof = yield* VerifyRolaProofService;
      const createConsultationMessage = yield* CreateConsultationMessageService;
      const addConsultationToDb = yield* AddConsultationToDbService;
      return {
        run: Effect.fn(function* (input: VerifyConsultationSignatureInput) {
          const expectedHash = yield* createConsultationMessage.run({
            consultationId: input.consultationId,
            selectedOption: input.selectedOption,
          });

          const actualHash = fromHex(input.rolaProof.challenge);

          if (!areUint8ArraysEqual(expectedHash, actualHash)) {
            return yield* Effect.fail(new VerifyConsultationSignatureError());
          }

          yield* verifyRolaProof.run(input.rolaProof);

          const items = input.rolaProof.items.map((item) => ({
            accountAddress: item.address,
            consultationId: input.consultationId,
            selectedOption: input.selectedOption,
            rolaProof: item.proof,
          }));

          yield* addConsultationToDb.run(items);
        }),
      };
    }),
  }
) {}
