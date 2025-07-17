import { seedSeason } from "./season";
import { seedWeeks } from "./weeks";
import { seedActivities } from "./activities";
import { seedActivityCategoryWeeks } from "./activityCategoryWeeks";

export const seed = async () => {
  await seedSeason();
  await seedWeeks();
  await seedActivities();
  await seedActivityCategoryWeeks();
  console.log("Seed completed");
  process.exit(0);
};

await seed();
