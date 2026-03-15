import { defineConfig } from 'vite';
import { builtinModules } from 'node:module';

export default defineConfig({
  build: {
    target: 'node22',
    outDir: 'dist',
    lib: {
      entry: 'src/index.ts',
      formats: ['es'],
      fileName: 'index',
    },
    rollupOptions: {
      external: [
        ...builtinModules,
        ...builtinModules.map((m) => `node:${m}`),
        /^@eventuras\//,
        'express',
        'discord.js',
        'zod',
        'dotenv',
        'uuidv7',
      ],
    },
    minify: false,
    sourcemap: true,
  },
});
