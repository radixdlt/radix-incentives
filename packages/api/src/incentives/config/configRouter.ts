import { TRPCError } from '@trpc/server';
import { Exit } from 'effect';
import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../trpc';

const PUBLIC_ENVIRONMENT_VARIABLES = {
  NEXT_PUBLIC_PREVIEW_BLOCK_ENABLED: process.env
    .NEXT_PUBLIC_PREVIEW_BLOCK_ENABLED
    ? new Date(process.env.NEXT_PUBLIC_PREVIEW_BLOCK_ENABLED)
    : null,
  NEXT_PUBLIC_LIMIT_ACCESS_ENABLED: process.env.NEXT_PUBLIC_LIMIT_ACCESS_ENABLED
    ? process.env.NEXT_PUBLIC_LIMIT_ACCESS_ENABLED === 'true'
    : false,
} as const;

export const configRouter = createTRPCRouter({
  getPublicConfig: publicProcedure.query(async ({ ctx }) => {
    const notificationResult =
      await ctx.dependencyLayer.getNotificationSettings();

    let notification = null;
    if (Exit.isSuccess(notificationResult)) {
      notification = notificationResult.value;
    } else {
      console.error(
        'Failed to get notification settings:',
        notificationResult.cause,
      );
    }

    return {
      ...PUBLIC_ENVIRONMENT_VARIABLES,
      notification,
    };
  }),
});

export const adminConfigRouter = createTRPCRouter({
  getPublicConfig: publicProcedure.query(async ({ ctx }) => {
    const notificationResult =
      await ctx.dependencyLayer.getNotificationSettings();

    let notification = null;
    if (Exit.isSuccess(notificationResult)) {
      notification = notificationResult.value;
    } else {
      console.error(
        'Failed to get notification settings:',
        notificationResult.cause,
      );
    }

    return {
      notification,
    };
  }),

  updateNotificationSettings: publicProcedure
    .input(
      z.object({
        message: z.string(),
        enabled: z.boolean(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const result =
        await ctx.dependencyLayer.updateNotificationSettings(input);

      if (Exit.isFailure(result)) {
        console.error('Failed to update notification settings:', result.cause);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update notification settings',
        });
      }

      return result.value;
    }),
});
