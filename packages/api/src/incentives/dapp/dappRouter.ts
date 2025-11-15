import { TRPCError } from '@trpc/server';
import { Exit } from 'effect';
import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../trpc';
import { CreateDappSchema, UpdateDappSchema } from './dapp';

export const dappRouter = createTRPCRouter({
  getDapps: publicProcedure.query(async ({ ctx }) => {
    const result = await ctx.dependencyLayer.getDapps();

    return Exit.match(result, {
      onSuccess: (value) => {
        return value;
      },
      onFailure: (error) => {
        console.error(error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred',
        });
      },
    });
  }),

  getDappsWithCategories: publicProcedure.query(async ({ ctx }) => {
    const result = await ctx.dependencyLayer.getDappsWithCategories();

    return Exit.match(result, {
      onSuccess: (value) => {
        return value;
      },
      onFailure: (error) => {
        console.error(error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred',
        });
      },
    });
  }),
});

export const adminDappRouter = createTRPCRouter({
  getDapps: publicProcedure.query(async ({ ctx }) => {
    const result = await ctx.dependencyLayer.getDapps();

    return Exit.match(result, {
      onSuccess: (value) => {
        return value;
      },
      onFailure: (error) => {
        console.error(error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred',
        });
      },
    });
  }),

  create: publicProcedure
    .input(CreateDappSchema)
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.dependencyLayer.createDapp(input);

      return Exit.match(result, {
        onSuccess: (value) => {
          return value;
        },
        onFailure: (error) => {
          console.error(error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'An unexpected error occurred',
          });
        },
      });
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        data: UpdateDappSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.dependencyLayer.updateDapp(input.id, input.data);

      return Exit.match(result, {
        onSuccess: (value) => {
          return value;
        },
        onFailure: (error) => {
          console.error(error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'An unexpected error occurred',
          });
        },
      });
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.dependencyLayer.deleteDapp(input.id);

      return Exit.match(result, {
        onSuccess: () => {
          return { success: true };
        },
        onFailure: (error) => {
          console.error(error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'An unexpected error occurred',
          });
        },
      });
    }),
});
