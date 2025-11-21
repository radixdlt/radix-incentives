import { Effect } from 'effect';
import { z } from 'zod';
import { resolveEffect } from '../runtime';
import { createTRPCRouter, publicProcedure } from '../trpc';
import { CreateDappSchema, DappService, UpdateDappSchema } from './dapp';

export const dappRouter = createTRPCRouter({
  getDapps: publicProcedure.query(async () =>
    resolveEffect(
      Effect.gen(function* () {
        const dappService = yield* DappService;
        return yield* dappService.list();
      }),
    ),
  ),

  getDappsWithCategories: publicProcedure.query(async () =>
    resolveEffect(
      Effect.gen(function* () {
        const dappService = yield* DappService;
        return yield* dappService.listWithCategories();
      }),
    ),
  ),
});

export const adminDappRouter = createTRPCRouter({
  getDapps: publicProcedure.query(async () =>
    resolveEffect(
      Effect.gen(function* () {
        const dappService = yield* DappService;
        return yield* dappService.list();
      }),
    ),
  ),

  create: publicProcedure.input(CreateDappSchema).mutation(async ({ input }) =>
    resolveEffect(
      Effect.gen(function* () {
        const dappService = yield* DappService;
        return yield* dappService.create(input);
      }),
    ),
  ),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        data: UpdateDappSchema,
      }),
    )
    .mutation(async ({ input }) =>
      resolveEffect(
        Effect.gen(function* () {
          const dappService = yield* DappService;
          return yield* dappService.update(input.id, input.data);
        }),
      ),
    ),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) =>
      resolveEffect(
        Effect.gen(function* () {
          const dappService = yield* DappService;
          yield* dappService.delete(input.id);
          return { success: true };
        }),
      ),
    ),
});
