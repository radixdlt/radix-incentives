import { createTRPCRouter, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { signedPersonaChallengeSchema } from "./rola/verifyRolaProof";
import { Effect } from "effect";

export const authRouter = createTRPCRouter({
  generateChallenge: publicProcedure.mutation(async ({ ctx }) => {
    const result = await ctx.dependencyLayer.createChallenge();

    if (result._tag === "Failure") {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
      });
    }

    return result.value;
  }),

  verifyProof: publicProcedure
    .input(signedPersonaChallengeSchema)
    .mutation(async ({ input, ctx }) => {
      const result = await ctx.dependencyLayer.signIn(input);

      if (result._tag === "Failure") {
        result.pipe(
          Effect.catchTags({
            DbError: () => {
              throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
              });
            },
            UnknownException: () => {
              throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
              });
            },
            InvalidChallengeError: () => {
              throw new TRPCError({
                code: "UNAUTHORIZED",
              });
            },
            InvalidProofTypeError: () => {
              throw new TRPCError({
                code: "UNAUTHORIZED",
              });
            },
            VerifyRolaProofError: () => {
              throw new TRPCError({
                code: "UNAUTHORIZED",
              });
            },
            ParseRolaProofInputError: () => {
              throw new TRPCError({
                code: "UNAUTHORIZED",
              });
            },
          })
        );
      } else {
        const { session, token } = result.value;

        await ctx.setSessionToken(token, session.expiresAt);

        return {
          success: true,
        };
      }
    }),

  // getSession: protectedProcedure.query(async ({ ctx }) => {
  //   const session = ctx.session;
  //   return session;
  // }),

  // signOut: protectedProcedure.mutation(async ({ ctx }) => {
  //   if (ctx.session.session) {
  //     await ctx.sessionHelper.invalidateSession(ctx.session.session.id);
  //     await ctx.onCreateSession("", new Date(0));
  //   }
  //   return { success: true };
  // }),

  // verifyProof: publicProcedure
  //   .input(
  //     z.object({
  //       persona: Persona,
  //       challenge: z.string(),
  //       proof: Proof,
  //     })
  //   )
  //   .mutation(async ({ input, ctx }) => {
  //     const [value] = await ctx.db
  //       .delete(challenge)
  //       .where(
  //         and(
  //           eq(challenge.challenge, input.challenge),
  //           gt(challenge.createdAt, new Date(Date.now() - 1000 * 60 * 5))
  //         )
  //       )
  //       .returning();

  //     if (!value) {
  //       throw new TRPCError({
  //         code: "UNAUTHORIZED",
  //       });
  //     }

  //     const result = await verifySignedChallenge({
  //       address: input.persona.identityAddress,
  //       type: "persona",
  //       challenge: input.challenge,
  //       proof: input.proof,
  //     });

  //     if (result.isErr()) {
  //       console.error(result.error);
  //       throw new TRPCError({
  //         code: "UNAUTHORIZED",
  //       });
  //     }

  //     await ctx.db
  //       .insert(user)
  //       .values({
  //         id: input.persona.identityAddress,
  //         label: input.persona.label,
  //       })
  //       .onConflictDoUpdate({
  //         target: [user.id],
  //         set: { label: input.persona.label },
  //       });

  //     const sessionToken = ctx.sessionHelper.generateSessionToken();
  //     const session = await ctx.sessionHelper.createSession(
  //       sessionToken,
  //       input.persona.identityAddress
  //     );

  //     await ctx.onCreateSession(sessionToken, session.expiresAt);

  //     return {
  //       success: true,
  //     };
  //   }),
});
