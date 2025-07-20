import { seasons, weeks } from "../schema";
import { db } from "../client";
import { desc, eq } from "drizzle-orm";

export const seedSeason = async () => {
  const seasonId = await db
    .select({ id: seasons.id })
    .from(seasons)
    .innerJoin(weeks, eq(seasons.id, weeks.seasonId))
    .orderBy(desc(weeks.endDate))
    .limit(1)
    .then((result) => result[0]);

  if (!seasonId) {
    await db
      .insert(seasons)
      .values([
        {
          name: "Season 1",
          status: "active",
        },
      ])
      .returning()
      .onConflictDoNothing();
  }
  console.log("Season seeded");
};
