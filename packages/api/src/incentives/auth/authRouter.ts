import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc';
import {
  CompleteRecoveryInput,
  ListAccountRecoveryProofsInput,
  StartRecoveryInput,
  SubmitRecoveryProofInput,
} from './accountRecovery';

export const authRouter = createTRPCRouter({
  generateChallenge: publicProcedure.mutation(async ({ ctx }) => {
    const result = await ctx.dependencyLayer.createChallenge();

    if (result._tag === 'Failure') {
      console.error(result.cause);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
      });
    }

    return result.value;
  }),

  signIn: publicProcedure
    .input(
      z.object({
        challenge: z.string(),
        type: z.enum(['persona']),
        address: z.string(),
        label: z.string(),
        proof: z.object({
          publicKey: z.string(),
          signature: z.string(),
          curve: z.enum(['curve25519', 'secp256k1']),
        }),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const referralCode = await ctx.getReferralCode();
      const result = await ctx.dependencyLayer.signIn({
        rolaProof: input,
        referralCode,
      });

      if (result._tag === 'Failure') {
        console.error(result.cause);

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
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

    if (result._tag === 'Failure') {
      console.error(result.cause);

      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
      });
    }

    await ctx.setSessionToken('', new Date(0));

    return {
      success: true,
    };
  }),

  isSignedIn: protectedProcedure
    .input(z.object({ identityAddress: z.string().optional() }))
    .query(async () => {
      return true;
    }),

  accountRecovery: {
    startRecovery: protectedProcedure
      .input(StartRecoveryInput.omit({ userId: true }))
      .mutation(async ({ input, ctx }) =>
        ctx.dependencyLayer.accountRecovery.startAccountRecovery({
          ...input,
          userId: ctx.session.user.id,
        }),
      ),
    submitProof: protectedProcedure
      .input(SubmitRecoveryProofInput.omit({ userId: true }))
      .mutation(async ({ input, ctx }) =>
        ctx.dependencyLayer.accountRecovery.submitAccountRecoveryProof({
          ...input,
          userId: ctx.session.user.id,
        }),
      ),
    listProofs: protectedProcedure
      .input(ListAccountRecoveryProofsInput.omit({ userId: true }))
      .query(async ({ input, ctx }) =>
        ctx.dependencyLayer.accountRecovery.listAccountRecoveryProofs({
          ...input,
          userId: ctx.session.user.id,
        }),
      ),
    pending: protectedProcedure.query(async ({ ctx }) =>
      ctx.dependencyLayer.accountRecovery.getPendingAccountRecovery(
        ctx.session.user.id,
      ),
    ),
    completeRecovery: protectedProcedure
      .input(CompleteRecoveryInput.omit({ userId: true }))
      .mutation(async ({ input, ctx }) =>
        ctx.dependencyLayer.accountRecovery.completeAccountRecovery({
          ...input,
          userId: ctx.session.user.id,
        }),
      ),
  },
});
