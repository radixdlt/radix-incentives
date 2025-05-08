import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const authRouter = createTRPCRouter({
  generateChallenge: publicProcedure.mutation(async ({ ctx }) => {
    const result = await ctx.dependencyLayer.createChallenge();

    if (result._tag === "Failure") {
      console.error(result.cause);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
      });
    }

    return result.value;
  }),

  signIn: publicProcedure
    .input(
      z.object({
        challenge: z.string(),
        type: z.enum(["persona"]),
        address: z.string(),
        label: z.string(),
        proof: z.object({
          publicKey: z.string(),
          signature: z.string(),
          curve: z.enum(["curve25519", "secp256k1"]),
        }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const result = await ctx.dependencyLayer.signIn(input);

      console.log(JSON.stringify({ result, input }, null, 2));

      if (result._tag === "Failure") {
        console.error(result.cause);

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
        });
      }

      const { session, token } = result.value;

      await ctx.setSessionToken(token, session.expiresAt);

      return {
        success: true,
      };
    }),

  signOut: protectedProcedure.mutation(async ({ ctx }) => {
    const result = await ctx.dependencyLayer.signOut(ctx.session.user.id);

    if (result._tag === "Failure") {
      console.error(result.cause);

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
      });
    }

    await ctx.setSessionToken("", new Date(0));

    return {
      success: true,
    };
  }),
});
