import { accountRouter } from '../account/accountRouter';
import {
  activityRouter,
  adminActivityRouter,
} from '../activity/activityRouter';
import {
  activityCategoryRouter,
  adminActivityCategoryRouter,
} from '../activity-category/activityCategoryRouter';
import { adminRouter } from '../admin/adminRouter';
import { authRouter } from '../auth/authRouter';
import {
  adminCompetitionRouter,
  competitionRouter,
} from '../competition/competitionRouter';
import { adminComponentWhitelistRouter } from '../component/componentWhitelistRouter';
import { adminConfigRouter, configRouter } from '../config/configRouter';
import { adminDappRouter, dappRouter } from '../dapp/dappRouter';
import { leaderboardRouter } from '../leaderboard/leaderboardRouter';
import {
  adminMilestoneRouter,
  milestoneRouter,
} from '../milestones/milestoneRouter';
import { resourceRewardRouter } from '../resource-reward/resourceRewardRouter';
import { adminSeasonRouter } from '../season/seasonRouter';
import { adminSeedRouter } from '../seed/seedRouter';
import { adminMarginAccountSeedingRouter } from '../surge/marginAccountSeedingRouter';
import { adminUserRouter, userRouter } from '../user/userRouter';
import { weekAdminRouter, weekRouter } from '../week/weekRouter';
import { createCallerFactory, createTRPCRouter } from '.';

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
  activityCategory: activityCategoryRouter,
  config: configRouter,
  week: weekRouter,
  dapps: dappRouter,
  milestones: milestoneRouter,
  resourceReward: resourceRewardRouter,
  competition: competitionRouter,
});

export const adminAppRouter = createTRPCRouter({
  auth: authRouter,
  account: accountRouter,
  activity: adminActivityRouter,
  activityCategory: adminActivityCategoryRouter,
  season: adminSeasonRouter,
  user: adminUserRouter,
  leaderboard: leaderboardRouter,
  config: adminConfigRouter,
  dapps: adminDappRouter,
  week: weekAdminRouter,
  componentWhitelist: adminComponentWhitelistRouter,
  marginAccountSeeding: adminMarginAccountSeedingRouter,
  seed: adminSeedRouter,
  admin: adminRouter,
  milestones: adminMilestoneRouter,
  competition: adminCompetitionRouter,
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
