import { Effect, Layer } from "effect";
import { GetWeekByIdService } from "../week/getWeekById";
import { GetSeasonByIdService } from "../season/getSeasonById";
import { GetActivitiesByWeekIdService } from "../activity/getActivitiesByWeekId";
import { GetUserActivityPointsService } from "../user/getUserActivityPoints";
import {
  CalculateSeasonPointsLive,
  CalculateSeasonPointsService,
} from "./calculateSeasonPoints";
import { mockDbClientLive } from "../../test-helpers/createMockDb";
import { BigNumber } from "bignumber.js";
import { ApplyMultiplierLive } from "../multiplier/applyMultiplier";
import { UpdateWeekStatusService } from "../week/updateWeekStatus";
import { AddSeasonPointsToUserService } from "./addSeasonPointsToUser";

// const dbClientLive = createDbClientLive(db);

const getWeekByIdLive = Layer.succeed(GetWeekByIdService, () =>
  Effect.succeed({
    id: "1",
    startDate: new Date("2025-06-01:00:00:00Z"),
    endDate: new Date("2025-06-07:00:00:00Z"),
    status: "active",
    seasonId: "1",
  })
) as any;

const getSeasonByIdLive = Layer.succeed(GetSeasonByIdService, () =>
  Effect.succeed({
    id: "1",
    name: "Season 1",
    status: "active",
    startDate: new Date("2025-05-01:00:00:00Z"),
    endDate: new Date("2025-07-01:00:00:00Z"),
  })
) as any;

const updateWeekStatusLive = Layer.succeed(UpdateWeekStatusService, () =>
  Effect.succeed(null)
) as any;

const addSeasonPointsToUserLive = Layer.succeed(
  AddSeasonPointsToUserService,
  () => Effect.succeed(null)
) as any;

const applyMultiplierLive = ApplyMultiplierLive;

const mockUsers = [
  { userId: "user-0", points: 732 },
  { userId: "user-1", points: 750 },
  { userId: "user-2", points: 643 },
  { userId: "user-3", points: 310 },
  { userId: "user-4", points: 780 },
  { userId: "user-5", points: 912 },
  { userId: "user-6", points: 681 },
  { userId: "user-7", points: 377 },
  { userId: "user-8", points: 414 },
  { userId: "user-9", points: 700 },
  { userId: "user-10", points: 182 },
  { userId: "user-11", points: 416 },
  { userId: "user-12", points: 4 },
  { userId: "user-13", points: 601 },
  { userId: "user-14", points: 671 },
  { userId: "user-15", points: 282 },
  { userId: "user-16", points: 94 },
  { userId: "user-17", points: 285 },
  { userId: "user-18", points: 770 },
  { userId: "user-19", points: 127 },
  { userId: "user-20", points: 646 },
  { userId: "user-21", points: 633 },
  { userId: "user-22", points: 152 },
  { userId: "user-23", points: 341 },
  { userId: "user-24", points: 995 },
  { userId: "user-25", points: 457 },
  { userId: "user-26", points: 383 },
  { userId: "user-27", points: 962 },
  { userId: "user-28", points: 766 },
  { userId: "user-29", points: 226 },
  { userId: "user-30", points: 690 },
  { userId: "user-31", points: 60 },
  { userId: "user-32", points: 178 },
  { userId: "user-33", points: 298 },
  { userId: "user-34", points: 7 },
  { userId: "user-35", points: 486 },
  { userId: "user-36", points: 793 },
  { userId: "user-37", points: 888 },
  { userId: "user-38", points: 398 },
  { userId: "user-39", points: 754 },
  { userId: "user-40", points: 701 },
  { userId: "user-41", points: 150 },
  { userId: "user-42", points: 483 },
  { userId: "user-43", points: 301 },
  { userId: "user-44", points: 518 },
  { userId: "user-45", points: 592 },
  { userId: "user-46", points: 298 },
  { userId: "user-47", points: 389 },
  { userId: "user-48", points: 551 },
  { userId: "user-49", points: 149 },
  { userId: "user-50", points: 974 },
  { userId: "user-51", points: 669 },
  { userId: "user-52", points: 784 },
  { userId: "user-53", points: 308 },
  { userId: "user-54", points: 625 },
  { userId: "user-55", points: 916 },
  { userId: "user-56", points: 242 },
  { userId: "user-57", points: 72 },
  { userId: "user-58", points: 446 },
  { userId: "user-59", points: 792 },
  { userId: "user-60", points: 975 },
  { userId: "user-61", points: 248 },
  { userId: "user-62", points: 166 },
  { userId: "user-63", points: 663 },
  { userId: "user-64", points: 112 },
  { userId: "user-65", points: 894 },
  { userId: "user-66", points: 649 },
  { userId: "user-67", points: 599 },
  { userId: "user-68", points: 673 },
  { userId: "user-69", points: 440 },
  { userId: "user-70", points: 380 },
  { userId: "user-71", points: 513 },
  { userId: "user-72", points: 455 },
  { userId: "user-73", points: 324 },
  { userId: "user-74", points: 104 },
  { userId: "user-75", points: 949 },
  { userId: "user-76", points: 723 },
  { userId: "user-77", points: 351 },
  { userId: "user-78", points: 132 },
  { userId: "user-79", points: 293 },
  { userId: "user-80", points: 720 },
  { userId: "user-81", points: 927 },
  { userId: "user-82", points: 944 },
  { userId: "user-83", points: 58 },
  { userId: "user-84", points: 30 },
  { userId: "user-85", points: 846 },
  { userId: "user-86", points: 253 },
  { userId: "user-87", points: 13 },
  { userId: "user-88", points: 339 },
  { userId: "user-89", points: 850 },
  { userId: "user-90", points: 437 },
  { userId: "user-91", points: 983 },
  { userId: "user-92", points: 433 },
  { userId: "user-93", points: 759 },
  { userId: "user-94", points: 623 },
  { userId: "user-95", points: 434 },
  { userId: "user-96", points: 939 },
  { userId: "user-97", points: 444 },
  { userId: "user-98", points: 326 },
  { userId: "user-99", points: 390 },
]
  .map((user) => ({
    ...user,
    points: new BigNumber(user.points),
  }))
  .sort((a, b) => a.points.comparedTo(b.points) ?? 0);

describe("calculateSeasonPoints", () => {
  it("should calculate season points", async () => {
    const program = Effect.gen(function* () {
      const calculateSeasonPoints = yield* CalculateSeasonPointsService;

      return yield* calculateSeasonPoints({
        seasonId: "1",
        weekId: "1",
      });
    }).pipe(
      Effect.catchAll((err) => {
        console.log(JSON.stringify(err, null, 2));
        return Effect.fail(err);
      })
    );

    const getActivitiesByWeekIdLive = Layer.succeed(
      GetActivitiesByWeekIdService,
      () =>
        Effect.succeed([
          {
            id: "1",
            name: "Activity 1",
            status: "active",
            activityId: "1",
            weekId: "1",
            pointsPool: 100,
          },
        ])
    ) as any;

    const getUserActivityPointsLive = Layer.succeed(
      GetUserActivityPointsService,
      () => Effect.succeed(mockUsers)
    ) as any;

    const calculateSeasonPointsLive = CalculateSeasonPointsLive.pipe(
      Layer.provide(getWeekByIdLive),
      Layer.provide(getSeasonByIdLive),
      Layer.provide(getActivitiesByWeekIdLive),
      Layer.provide(getUserActivityPointsLive),
      Layer.provide(applyMultiplierLive),
      Layer.provide(updateWeekStatusLive),
      Layer.provide(addSeasonPointsToUserLive)
    );

    const result = await Effect.runPromise(
      // @ts-expect-error - mocked services
      Effect.provide(
        program,
        Layer.mergeAll(
          mockDbClientLive,
          calculateSeasonPointsLive,
          getWeekByIdLive,
          getSeasonByIdLive,
          getActivitiesByWeekIdLive,
          getUserActivityPointsLive,
          applyMultiplierLive,
          updateWeekStatusLive,
          addSeasonPointsToUserLive
        )
      )
    );

    console.log(JSON.stringify(result, null, 2));
  });
});
