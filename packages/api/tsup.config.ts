import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: {
    only: true,
  },
  noExternal: ['db'],
  clean: true,
});
