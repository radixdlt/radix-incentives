import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  external: [
    /^node:.*/,
    'ioredis',
    'url',
    'minipass-fetch',
    'node-fetch',
    'undici',
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
