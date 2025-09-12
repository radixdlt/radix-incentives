import { dapps } from 'db/incentives';
import { eq } from 'drizzle-orm';
import { Data, Effect } from 'effect';
import { z } from 'zod';
import { DbClientService, DbError, dbClientLive } from '../db/dbClient';

export const DappSchema = z.object({
  id: z.string(),
  name: z.string(),
  website: z.string(),
  logoFileName: z.string().nullable(),
});

export const CreateDappSchema = z.object({
  id: z.string(),
  name: z.string(),
  website: z.string(),
  logoFileName: z.string().optional(),
});

export const UpdateDappSchema = CreateDappSchema;

export type Dapp = z.infer<typeof DappSchema>;
export type CreateDapp = z.infer<typeof CreateDappSchema>;
export type UpdateDapp = z.infer<typeof UpdateDappSchema>;

class DappNotFoundError extends Data.TaggedError('DappNotFoundError')<{
  message: string;
}> {}

export class DappService extends Effect.Service<DappService>()('DappService', {
  dependencies: [dbClientLive],
  effect: Effect.gen(function* () {
    const db = yield* DbClientService;
    return {
      list: Effect.fn(function* () {
        const dappList = yield* Effect.tryPromise({
          try: () => db.select().from(dapps),
          catch: (error) => new DbError(error),
        });
        return dappList as Dapp[];
      }),
      getById: Effect.fn(function* (id: string) {
        const dapp = yield* Effect.tryPromise({
          try: () =>
            db
              .select()
              .from(dapps)
              .where(eq(dapps.id, id))
              .limit(1)
              .then((result) => result[0]),
          catch: (error) => new DbError(error),
        });

        if (!dapp) {
          return yield* Effect.fail(
            new DappNotFoundError({
              message: `Dapp ${id} not found`,
            }),
          );
        }

        return dapp;
      }),
      create: Effect.fn(function* (input: CreateDapp) {
        const dapp = yield* Effect.tryPromise({
          try: () =>
            db
              .insert(dapps)
              .values({
                id: input.id,
                name: input.name,
                website: input.website,
                logoFileName: input.logoFileName || null,
              })
              .returning()
              .then((result) => result[0]),
          catch: (error) => new DbError(error),
        });

        return dapp;
      }),
      update: Effect.fn(function* (input: UpdateDapp) {
        const dapp = yield* Effect.tryPromise({
          try: () =>
            db
              .update(dapps)
              .set({
                name: input.name,
                website: input.website,
                logoFileName: input.logoFileName || null,
              })
              .where(eq(dapps.id, input.id))
              .returning()
              .then((result) => result[0]),
          catch: (error) => new DbError(error),
        });

        if (!dapp) {
          return yield* Effect.fail(
            new DappNotFoundError({
              message: `Dapp ${input.id} not found`,
            }),
          );
        }

        return dapp;
      }),
      delete: Effect.fn(function* (id: string) {
        const deletedDapp = yield* Effect.tryPromise({
          try: () =>
            db
              .delete(dapps)
              .where(eq(dapps.id, id))
              .returning()
              .then((result) => result[0]),
          catch: (error) => new DbError(error),
        });

        if (!deletedDapp) {
          return yield* Effect.fail(
            new DappNotFoundError({
              message: `Dapp ${id} not found`,
            }),
          );
        }

        return deletedDapp;
      }),
    };
  }),
}) {}
