import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  external: [
    /^node:.*/,
    "url",
    "pino",
    "pino-pretty",
    "pino-abstract-transport",
    // OpenTelemetry packages that cause bundling issues
    /^@opentelemetry\/.*/,
    "bullmq-otel",
    // Packages that use dynamic require and cause ESM issues
    "minipass-fetch",
    "make-fetch-happen",
    "node-fetch",
    "undici",
    // Bull MQ and Redis related
    "bullmq",
    "ioredis",
  ],
  dts: false,
  splitting: false,
  clean: true,
  minify: false,
  noExternal: [
    "api",
    "db",
    "sbor-ez-mode",
    "@noble/hashes",
    "bip39",
    "ed25519-hd-key",
  ],
});
