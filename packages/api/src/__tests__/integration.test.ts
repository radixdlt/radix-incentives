import { db } from "db";
import { createCaller } from "../trpc/appRouter";

const appRouter = createCaller({
  headers: new Headers(),
  db: db,
  session: {
    user: {
      id: "1",
    },
  },
});
describe("Integration Test", () => {
  it("should pass", async () => {
    const result = await appRouter.auth.generateChallenge();
    expect(result).toHaveLength(64);
  });
});
