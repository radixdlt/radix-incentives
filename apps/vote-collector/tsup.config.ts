import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  external: ["/^node:.*/"],
  dts: false,
  splitting: false,
  clean: true,
  minify: false,
  noExternal: ["api", "db", "pino"],
});
