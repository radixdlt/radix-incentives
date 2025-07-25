import { createCallerFactory, createTRPCRouter } from ".";
import { authRouter } from "../auth/authRouter";
import { accountRouter } from "../account/accountRouter";
import {
  activityRouter,
  adminActivityRouter,
} from "../activity/activityRouter";
import { adminSeasonRouter } from "../season/seasonRouter";
import { adminUserRouter, userRouter } from "../user/userRouter";
import { leaderboardRouter } from "../leaderboard/leaderboardRouter";
import { configRouter } from "../config/configRouter";
import { weekAdminRouter, weekRouter } from "../week/weekRouter";
import { adminDappRouter, dappRouter } from "../dapp/dappRouter";
import { adminComponentWhitelistRouter } from "../component/componentWhitelistRouter";
import { adminSeedRouter } from "../seed/seedRouter";

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
  dapps: adminDappRouter,
  week: weekAdminRouter,
  componentWhitelist: adminComponentWhitelistRouter,
  seed: adminSeedRouter,
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
