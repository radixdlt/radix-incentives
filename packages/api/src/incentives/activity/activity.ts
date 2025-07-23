import { Effect } from "effect";
import { DbClientService, DbError } from "../db/dbClient";
import { activities, type NewActivity } from "db/incentives";
import { eq } from "drizzle-orm";
import { z } from "zod";

const ActivityDataSchema = z.object({
  showOnEarnPage: z.boolean(),
  ap: z.boolean(),
  multiplier: z.boolean(),
});

export const UpdateActivitySchema = z.object({
  id: z.string(),
  activity: z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    category: z.string().optional(),
    dapp: z.string().optional(),
    componentAddresses: z.array(z.string()),
    data: ActivityDataSchema,
  }),
});

export const ActivitySchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  description: z.string().optional(),
  category: z.string(),
  dapp: z.string(),
  componentAddresses: z.array(z.string()),
  data: ActivityDataSchema,
});

export type UpdateActivityInput = z.infer<typeof UpdateActivitySchema>;
export type Activity = z.infer<typeof ActivitySchema>;

export class ActivityService extends Effect.Service<ActivityService>()(
  "ActivityService",
  {
    effect: Effect.gen(function* () {
      const db = yield* DbClientService;
      return {
        list: Effect.fn(function* () {
          return yield* Effect.tryPromise({
            try: async () => {
              const activities = await db.query.activities.findMany({
                with: {
                  dapp: true,
                },
              });
              return activities as Activity[];
            },
            catch: (error) => new DbError(error),
          });
        }),
        getById: Effect.fn(function* (id: string) {
          return yield* Effect.tryPromise({
            try: async () => {
              const activity = await db.query.activities.findFirst({
                where: eq(activities.id, id),
                with: {
                  dapp: true,
                },
              });
              return activity as Activity;
            },
            catch: (error) => new DbError(error),
          });
        }),
        create: Effect.fn(function* (activity: NewActivity) {
          return yield* Effect.tryPromise({
            try: async () => {
              const [newActivity] = await db
                .insert(activities)
                .values(activity)
                .returning();
              return newActivity as Activity;
            },
            catch: (error) => new DbError(error),
          });
        }),
        update: Effect.fn(function* ({
          id,
          activity: { category, dapp, componentAddresses, ...rest },
        }: UpdateActivityInput) {
          return yield* Effect.tryPromise({
            try: async () => {
              await db
                .update(activities)
                .set({
                  ...rest,
                })
                .where(eq(activities.id, id));
            },
            catch: (error) => new DbError(error),
          });
        }),
      };
    }),
  }
) {}
