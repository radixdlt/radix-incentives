import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

import type { Account } from "db/incentives";
import { verifyAccountOwnershipInputSchema } from "../programs/verifyAccountOwnership";

export const accountRouter = createTRPCRouter({
  verifyAccountOwnership: protectedProcedure
    .input(verifyAccountOwnershipInputSchema.omit({ userId: true }))
    .mutation(async ({ input, ctx }): Promise<Account[]> => {
      const userId = ctx.session.user.id;
      const result = await ctx.dependencyLayer.verifyAccountOwnership({
        ...input,
        userId,
      });

      if (result._tag === "Failure") {
        console.error(result.cause);

        if (result.cause._tag === "Fail") {
          switch (result.cause.error._tag) {
            case "InvalidChallengeError":
            case "InvalidProofError":
            case "ParseRolaProofInputError":
            case "VerifyRolaProofError":
              throw new TRPCError({
                code: "BAD_REQUEST",
                message: "Invalid account ownership proof",
              });
            case "AccountAlreadyRegisteredError":
              throw new TRPCError({
                code: "BAD_REQUEST",
                message:
                  typeof result.cause.error === "string"
                    ? result.cause.error
                    : "Account already registered",
              });
            case "VirtualAccountError":
              throw new TRPCError({
                code: "BAD_REQUEST",
                message: `Account is virtual and has not been persisted on-ledger. Please use the account in a transaction first to create it on-ledger.`,
              });
            case "CheckAccountPersistenceError":
              throw new TRPCError({
                code: "BAD_REQUEST",
                message: "Unable to verify account. Please check the account address and try again.",
              });
          }
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
        });
      }

      return result.value;
    }),

  getAccounts: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const result = await ctx.dependencyLayer.getAccounts(userId);

    if (result._tag === "Failure") {
      console.error(result.cause);

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
      });
    }

    return result.value;
  }),
});
