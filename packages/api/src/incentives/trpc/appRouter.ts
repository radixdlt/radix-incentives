import { accountRouter } from '../account/accountRouter';
import {
  activityRouter,
  adminActivityRouter,
} from '../activity/activityRouter';
import { authRouter } from '../auth/authRouter';
import { adminComponentWhitelistRouter } from '../component/componentWhitelistRouter';
import { adminConfigRouter, configRouter } from '../config/configRouter';
import { adminDappRouter, dappRouter } from '../dapp/dappRouter';
import { leaderboardRouter } from '../leaderboard/leaderboardRouter';
import { adminSeasonRouter } from '../season/seasonRouter';
import { adminSeedRouter } from '../seed/seedRouter';
import { adminUserRouter, userRouter } from '../user/userRouter';
import { weekAdminRouter, weekRouter } from '../week/weekRouter';
import { createCallerFactory, createTRPCRouter } from '.';
import { adminRouter } from '../admin/adminRouter';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  auth: authRouter,
  account: accountRouter,
  user: userRouter,
  leaderboard: leaderboardRouter,
  activity: activityRouter,
  config: configRouter,
  week: weekRouter,
  dapps: dappRouter,
});

export const adminAppRouter = createTRPCRouter({
  auth: authRouter,
  account: accountRouter,
  activity: adminActivityRouter,
  season: adminSeasonRouter,
  user: adminUserRouter,
  leaderboard: leaderboardRouter,
  config: adminConfigRouter,
  dapps: adminDappRouter,
  week: weekAdminRouter,
  componentWhitelist: adminComponentWhitelistRouter,
  seed: adminSeedRouter,
  admin: adminRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

export type AdminAppRouter = typeof adminAppRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);

export const createAdminCaller = createCallerFactory(adminAppRouter);
