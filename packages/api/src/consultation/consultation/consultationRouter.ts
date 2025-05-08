import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { verifyConsultationSignatureInputSchema } from "../programs/verifyConsultationSignature";
import { z } from "zod";
import { createConsultationMessageHash } from "./createConsultationHash";
import { toHex } from "../../common/crypto";

export const consultationRouter = createTRPCRouter({
  createConsultationHash: protectedProcedure
    .input(
      z.object({
        consultationId: z.string(),
        selectedOption: z.string(),
      })
    )
    .mutation(
      async ({ input }) =>
        await createConsultationMessageHash(input).then(toHex)
    ),

  verifyConsultationSignature: protectedProcedure
    .input(verifyConsultationSignatureInputSchema)
    .mutation(async ({ input, ctx }) => {
      if (new Date("2025-05-19T23:59:00Z") < new Date()) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Consultation has ended",
        });
      }

      const result =
        await ctx.dependencyLayer.verifyConsultationSignature(input);

      if (result._tag === "Failure") {
        console.error(result.cause);
        if (result.cause._tag === "Fail") {
          switch (result.cause.error._tag) {
            case "VerifyConsultationSignatureError":
            case "VerifyRolaProofError":
            case "ParseRolaProofInputError":
            case "CreateConsultationMessageError":
            case "ParseConsultationError":
            case "InsertConsultationError":
              throw new TRPCError({ code: "BAD_REQUEST" });
          }
        }
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),

  getConsultations: protectedProcedure.query(async ({ ctx }) => {
    const result = await ctx.dependencyLayer.getConsultations(
      ctx.session.user.id
    );
    if (result._tag === "Failure") {
      console.error(result.cause);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
    return result.value;
  }),
});
