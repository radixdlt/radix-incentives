import { seedActivities } from './activities';
import { seedActivityCategoryWeeks } from './activityCategoryWeeks';
import { seedSeason } from './season';
import { seedWeeks } from './weeks';

export const seed = async () => {
  await seedSeason();
  await seedWeeks();
  await seedActivities();
  await seedActivityCategoryWeeks();
  console.log('Seed completed');
  process.exit(0);
};

await seed();
