import { defineConfig, type UserConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';
import { glob } from 'glob';
import fs from 'fs';

/**
 * Plugin to preserve 'use client' directives in React Server Components.
 * This ensures client-side code is properly marked when building for Next.js.
 */
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
              // Remove leading comments to check for 'use client'
              const withoutComments = content
                .replace(/^(\s*\/\/.*\n)+/, '')
                .replace(/^(\s*\/\*[\s\S]*?\*\/\s*)/, '');
              return (
                withoutComments.trimStart().startsWith("'use client'") ||
                withoutComments.trimStart().startsWith('"use client"')
              );
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
    },
  };
}

export interface ReactLibConfig {
  /**
   * Library entry point(s). Can be:
   * - A string path: 'src/index.ts'
   * - An object with multiple entries: { index: 'src/index.ts', utils: 'src/utils.ts' }
   * - A glob pattern: 'src/** /index.ts' (auto-discovers multiple entry points)
   */
  entry: string | Record<string, string>;

  /**
   * Additional external dependencies to exclude from the bundle.
   * React, react-dom, and react/jsx-runtime are already included.
   */
  external?: (string | RegExp)[];

  /**
   * Enable Tailwind CSS support via @tailwindcss/vite plugin.
   * @default false
   */
  tailwind?: boolean;

  /**
   * Preserve module structure in output.
   * When true, creates a dist structure mirroring src structure.
   * When false, bundles everything into fewer files.
   * @default true
   */
  preserveModules?: boolean;

  /**
   * Enable 'use client' directive preservation for Next.js React Server Components.
   * @default true
   */
  preserveUseClientDirectives?: boolean;

  /**
   * Use SWC instead of Babel for React transformation (faster builds).
   * @default false
   */
  useSWC?: boolean;

  /**
   * TypeScript declaration options.
   */
  dts?: {
    /**
     * Entry root for DTS generation.
     * @default 'src'
     */
    entryRoot?: string;
    /**
     * Output directory for .d.ts files.
     * @default 'dist'
     */
    outDir?: string;
    /**
     * Roll up types into a single .d.ts file.
     * @default false
     */
    rollupTypes?: boolean;
  };

  /**
   * Additional Vite configuration to merge.
   */
  viteConfig?: UserConfig;
}

/**
 * Vite configuration preset for React libraries.
 * Includes React plugin, TypeScript declarations, and common React externals.
 */
export function defineReactLibConfig(config: ReactLibConfig): UserConfig {
  const {
    entry,
    external = [],
    tailwind = false,
    preserveModules = true,
    preserveUseClientDirectives = true,
    useSWC = false,
    dts: dtsOptions = {},
    viteConfig = {},
  } = config;

  // Determine entry points
  const entryPoints =
    typeof entry === 'string' && entry.includes('*')
      ? glob.sync(resolve(process.cwd(), entry))
      : typeof entry === 'string'
        ? resolve(process.cwd(), entry)
        : entry;

  // Common React externals
  const reactExternals = ['react', 'react-dom', 'react/jsx-runtime'];

  const plugins: any[] = [];

  // Add React plugin (SWC or standard)
  if (useSWC) {
    // Dynamically import SWC plugin only when needed
    const reactSwc = require('@vitejs/plugin-react-swc').default;
    plugins.push(reactSwc());
  } else {
    plugins.push(react());
  }

  // Add Tailwind if enabled
  if (tailwind) {
    plugins.push(tailwindcss());
  }

  // Add DTS plugin
  plugins.push(
    dts({
      entryRoot: dtsOptions.entryRoot || 'src',
      outDir: dtsOptions.outDir || 'dist',
      include: ['src/**/*'],
      exclude: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx', '**/*.stories.tsx'],
      copyDtsFiles: true,
      rollupTypes: dtsOptions.rollupTypes || false,
    })
  );

  // Add use client preservation if enabled
  if (preserveUseClientDirectives) {
    plugins.push(preserveUseClient());
  }

  // Add custom plugins from viteConfig
  if (viteConfig.plugins) {
    plugins.push(...viteConfig.plugins);
  }

  return defineConfig({
    plugins,
    resolve: {
      alias: {
        '@': resolve(process.cwd(), './src'),
        ...viteConfig.resolve?.alias,
      },
      ...viteConfig.resolve,
    },
    build: {
      lib: {
        entry: entryPoints,
        formats: ['es'],
      },
      rollupOptions: {
        ...viteConfig.build?.rollupOptions,
        external: [...reactExternals, ...external],
        output: {
          preserveModules,
          ...(preserveModules && {
            preserveModulesRoot: 'src',
            entryFileNames: '[name].js',
          }),
          ...viteConfig.build?.rollupOptions?.output,
        },
      },
      // Spread other build options from viteConfig except lib and rollupOptions
      ...Object.fromEntries(
        Object.entries(viteConfig.build || {}).filter(
          ([key]) => key !== 'lib' && key !== 'rollupOptions'
        )
      ),
    },
    // Spread other viteConfig options except build, plugins, and resolve
    ...Object.fromEntries(
      Object.entries(viteConfig).filter(
        ([key]) => key !== 'build' && key !== 'plugins' && key !== 'resolve'
      )
    ),
  });
}
