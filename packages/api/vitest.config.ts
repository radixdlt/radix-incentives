import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    env: {
      DAPP_DEFINITION_ADDRESS:
        'account_rdx129zzrj4mwjwec8e6rmsvcz0hx4lp7uj3kf73w8rd2fek4cryaemewh',
      DATABASE_URL:
        'postgres://postgres:password@localhost:5432/radix-incentives',
      WORKERS_API_BASE_URL: 'http://localhost:3003',
    },
    globalSetup: './src/test-config/global-setup.ts',
    setupFiles: ['./src/test-config/setup.ts'],
    testTimeout: 30_000, // 30 seconds global timeout
    retry: 0, // Retry failed tests up to 3 times
    // Run tests sequentially to avoid database conflicts and race conditions
    pool: 'forks',
    fileParallelism: false,
    poolOptions: {
      forks: {
        singleFork: true, // Run all tests in a single fork (sequential)
      },
    },
    coverage: {
      reporter: ['text', 'json', 'json-summary', 'html', 'lcov', 'cobertura'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/**',
        'src/test-config/**',
        '**/*.test.ts',
        '**/*.spec.ts',
        'coverage/**',
      ],
    },
    // Fix for Windows ESM path resolution issues
    server: {
      deps: {
        inline: [
          '@effect/opentelemetry',
          '@opentelemetry/sdk-trace-node',
          '@opentelemetry/sdk-trace-base',
        ],
      },
    },
  },
});
