import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/cli.ts"],
  format: ["esm"],
  target: "node18",
  dts: false,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ["api", "db"],
});
