import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  external: [
    /^node:.*/,
    'url',
    // OpenTelemetry packages that cause bundling issues
    /^@opentelemetry\/.*/,
    'bullmq-otel',
    // Packages that use dynamic require and cause ESM issues
    'minipass-fetch',
    'node-fetch',
    'undici',
    // Bull MQ and Redis related
    'bullmq',
    'ioredis',
    'pino',
    // WebSocket package - uses dynamic require for Node.js built-ins
    'ws',
    // CSV parsing library
    'papaparse',
  ],
  dts: false,
  splitting: false,
  clean: true,
  minify: false,
  noExternal: [
    'api',
    'db',
    'sbor-ez-mode',
    '@noble/hashes',
    'bip39',
    'ed25519-hd-key',
  ],
});
