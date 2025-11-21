import { dapps } from 'db/incentives';
import { eq } from 'drizzle-orm';
import { Effect } from 'effect';
import { z } from 'zod';
import { DbService } from '../db/dbClient';

export const DappSchema = z.object({
  id: z.string(),
  name: z.string(),
  website: z.string(),
  description: z.string().nullable(),
  longDescription: z.string().nullable(),
  tags: z
    .array(z.string())
    .nullable()
    .transform((val) => val ?? []),
  resources: z
    .array(
      z.object({
        title: z.string(),
        url: z.string(),
      }),
    )
    .nullable()
    .transform((val) => val ?? []),
  showOnEarnPage: z.boolean(),
});

export const CreateDappSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  website: z.string().url(),
  description: z.string().nullable(),
  longDescription: z.string().nullable(),
  tags: z.array(z.string()),
  resources: z.array(
    z.object({
      title: z.string(),
      url: z.string(),
    }),
  ),
  showOnEarnPage: z.boolean().default(true),
});

export const UpdateDappSchema = z.object({
  name: z.string().min(1),
  website: z.string().url(),
  description: z.string().nullable(),
  longDescription: z.string().nullable(),
  tags: z.array(z.string()),
  resources: z.array(
    z.object({
      title: z.string(),
      url: z.string(),
    }),
  ),
  showOnEarnPage: z.boolean(),
});

export type Dapp = z.infer<typeof DappSchema>;
export type CreateDapp = z.infer<typeof CreateDappSchema>;
export type UpdateDapp = z.infer<typeof UpdateDappSchema>;

export class DappService extends Effect.Service<DappService>()('DappService', {
  dependencies: [DbService.Default],
  effect: Effect.gen(function* () {
    const db = yield* DbService;
    return {
      list: Effect.fn(function* () {
        const dapps = yield* db.use((db) => db.query.dapps.findMany());
        return dapps.map((dapp) => DappSchema.parse(dapp));
      }),
      listWithCategories: Effect.fn(function* () {
        const dapps = yield* db.use((db) =>
          db.query.dapps.findMany({
            with: {
              activities: {
                columns: {
                  category: true,
                },
                with: {
                  activityCategories: {
                    columns: {
                      id: true,
                      name: true,
                      icon: true,
                      color: true,
                    },
                  },
                },
              },
            },
          }),
        );
        return dapps.map((dapp) => ({
          ...DappSchema.parse(dapp),
          activities: dapp.activities,
        }));
      }),
      create: Effect.fn(function* (data: CreateDapp) {
        const result = yield* db.use((db) =>
          db.insert(dapps).values(data).returning(),
        );
        return result[0];
      }),
      update: Effect.fn(function* (id: string, data: UpdateDapp) {
        const result = yield* db.use((db) =>
          db.update(dapps).set(data).where(eq(dapps.id, id)).returning(),
        );
        return result[0];
      }),
      delete: Effect.fn(function* (id: string) {
        yield* db.use((db) => db.delete(dapps).where(eq(dapps.id, id)));
      }),
    };
  }),
}) {}
