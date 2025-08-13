import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../trpc';

import { and, eq } from 'drizzle-orm';
import {
  accountActivityPoints,
  accountBalances,
  accounts,
  db,
  user,
} from 'db/incentives';

export const adminRouter = createTRPCRouter({
  user: {
    getUser: publicProcedure
      .input(
        z.object({
          id: z.string(),
        }),
      )
      .query(async ({ input }) => {
        return Promise.all([
          db.query.user.findFirst({
            where: eq(user.id, input.id),
          }),
          db.query.accounts.findMany({
            where: eq(accounts.userId, input.id),
          }),
        ]).then(([user, accounts]) => ({
          ...user,
          accounts,
        }));
      }),

    getActivityPoints: publicProcedure
      .input(
        z.object({
          address: z.string(),
        }),
      )
      .query(async ({ input }) => {
        return db.query.accountActivityPoints.findMany({
          where: and(eq(accountActivityPoints.accountAddress, input.address)),
        });
      }),

    getAccountBalances: publicProcedure
      .input(
        z.object({
          address: z.string(),
        }),
      )
      .query(async ({ input }) => {
        return db.query.accountBalances.findMany({
          where: and(eq(accountBalances.accountAddress, input.address)),
        });
      }),
  },
});
