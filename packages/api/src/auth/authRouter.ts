import { Rola } from "@radixdlt/rola";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { Persona, Proof } from "radix-connect";
import { TRPCError } from "@trpc/server";
import { challenge, user } from "db";
import { and, eq, gt } from "drizzle-orm";

const expectedOrigin =
  process.env.VERCEL_ENV === "production"
    ? "https://app.hookah.ing"
    : process.env.VERCEL_BRANCH_URL
      ? `https://${process.env.VERCEL_BRANCH_URL}`
      : "http://localhost:3000";

const { verifySignedChallenge } = Rola({
  networkId: 1,
  applicationName: "Hookah",
  dAppDefinitionAddress:
    "account_rdx12xgr6cx4w85nc7655p6mcgtu8h03qukyz8gymlhe8vg9zddf52y5qp",
  expectedOrigin,
});

export const authRouter = createTRPCRouter({
  getSession: protectedProcedure.query(async ({ ctx }) => {
    const session = ctx.session;
    return session;
  }),

  signOut: protectedProcedure.mutation(async ({ ctx }) => {
    if (ctx.session.session) {
      await ctx.sessionHelper.invalidateSession(ctx.session.session.id);
      await ctx.onCreateSession("", new Date(0));
    }
    return { success: true };
  }),

  generateChallenge: publicProcedure.mutation(async ({ ctx }) => {
    const [value] = await ctx.db.insert(challenge).values({}).returning();

    if (!value) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
      });
    }

    return value.challenge;
  }),

  verifyProof: publicProcedure
    .input(
      z.object({
        persona: Persona,
        challenge: z.string(),
        proof: Proof,
      })
    )
    .mutation(async ({ input, ctx }) => {
      const [value] = await ctx.db
        .delete(challenge)
        .where(
          and(
            eq(challenge.challenge, input.challenge),
            gt(challenge.createdAt, new Date(Date.now() - 1000 * 60 * 5))
          )
        )
        .returning();

      if (!value) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
        });
      }

      const result = await verifySignedChallenge({
        address: input.persona.identityAddress,
        type: "persona",
        challenge: input.challenge,
        proof: input.proof,
      });

      if (result.isErr()) {
        console.error(result.error);
        throw new TRPCError({
          code: "UNAUTHORIZED",
        });
      }

      await ctx.db
        .insert(user)
        .values({
          id: input.persona.identityAddress,
          label: input.persona.label,
        })
        .onConflictDoUpdate({
          target: [user.id],
          set: { label: input.persona.label },
        });

      const sessionToken = ctx.sessionHelper.generateSessionToken();
      const session = await ctx.sessionHelper.createSession(
        sessionToken,
        input.persona.identityAddress
      );

      await ctx.onCreateSession(sessionToken, session.expiresAt);

      return {
        success: true,
      };
    }),
});
