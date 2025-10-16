import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { glob } from 'glob';
import { extname, relative, resolve } from 'path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import fs from 'fs';

// Plugin to preserve 'use client' directives
function preserveUseClient() {
  return {
    name: 'preserve-use-client',
    enforce: 'post' as const,
    generateBundle(_options: any, bundle: any) {
      for (const [fileName, chunk] of Object.entries(bundle)) {
        if ((chunk as any).type === 'chunk') {
          const chunkData = chunk as any;
          // Check if any source module had 'use client'
          const hasClientDirective = chunkData.moduleIds?.some((id: string) => {
            try {
              const content = fs.readFileSync(id, 'utf-8');
              return content.trimStart().startsWith("'use client'") || content.trimStart().startsWith('"use client"');
            } catch {
              return false;
            }
          });

          if (hasClientDirective) {
            const codeStart = chunkData.code.trimStart();
            if (!codeStart.startsWith("'use client'") && !codeStart.startsWith('"use client"')) {
              chunkData.code = `'use client';\n${chunkData.code}`;
            }
          }
        }
      }
    }
  };
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    dts({
      entryRoot: 'src',
      outDir: 'dist',
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      exclude: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'src/**/*.stories.tsx'],
      copyDtsFiles: false,
      rollupTypes: false,
      insertTypesEntry: true,
    }),
    preserveUseClient(),
  ],
  resolve: { alias: { '@': resolve(__dirname, './src') } },
  build: {
    lib: {
      entry: glob.sync(resolve(__dirname, 'src/**/index.ts')),
      formats: ['es'],
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: '[name].js',
        assetFileNames: 'assets/[name][extname]',
      },
    },
  },
});
