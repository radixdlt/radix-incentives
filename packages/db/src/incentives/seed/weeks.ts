import { db } from "../client";
import { seasons, weeks } from "../schema";

export const seedWeeks = async () => {
  const weeksResults = await db.select().from(weeks);

  if (weeksResults.length === 0) {
    const seasonId = await db
      .select()
      .from(seasons)
      .limit(1)
      .then((result) => result[0]?.id);

    if (!seasonId) {
      throw new Error("Season not found");
    }

    await db.insert(weeks).values([
      {
        seasonId,
        startDate: new Date("2025-07-07:00:00:00Z"),
        endDate: new Date("2025-07-13:23:59:59Z"),
      },
    ]);
  }
};
