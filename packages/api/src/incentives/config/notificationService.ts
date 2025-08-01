import { Effect } from "effect";
import { DbClientService, DbError } from "../db/dbClient";
import { config } from "db/incentives";
import { eq } from "drizzle-orm";

export type NotificationSettings = {
  message: string;
  enabled: boolean;
};

export class NotificationService extends Effect.Service<NotificationService>()(
  "NotificationService",
  {
    effect: Effect.gen(function* () {
      const db = yield* DbClientService;

      return {
        getNotificationSettings: Effect.fn(function* () {
          return yield* Effect.tryPromise({
            try: () =>
              db
                .select()
                .from(config)
                .where(eq(config.key, "notification"))
                .limit(1)
                .then((result) => {
                  if (result.length > 0) {
                    return result[0]?.value as NotificationSettings;
                  }
                  return null;
                }),
            catch: (error) => new DbError(error),
          });
        }),

        updateNotificationSettings: Effect.fn(function* (
          settings: NotificationSettings
        ) {
          return yield* Effect.tryPromise({
            try: () =>
              db
                .insert(config)
                .values({
                  key: "notification",
                  value: settings,
                })
                .onConflictDoUpdate({
                  target: config.key,
                  set: {
                    value: settings,
                  },
                })
                .then(() => ({ success: true })),
            catch: (error) => new DbError(error),
          });
        }),
      };
    }),
  }
) {}
