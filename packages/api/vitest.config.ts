import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    globalSetup: "./src/test-config/global-setup.ts",
    testTimeout: 30_000, // 30 seconds global timeout
    retry: 3, // Retry failed tests up to 3 times
    // Run tests sequentially to avoid database conflicts and race conditions
    pool: "forks",
    fileParallelism: false,
    poolOptions: {
      forks: {
        singleFork: true, // Run all tests in a single fork (sequential)
      },
    },
  },
});
