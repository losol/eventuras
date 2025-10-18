import { defineConfig, type UserConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export interface VanillaLibConfig {
  /**
   * Library entry point(s). Can be a string or an object with multiple entries.
   * @example 'src/index.ts'
   * @example { index: 'src/index.ts', utils: 'src/utils.ts' }
   */
  entry: string | Record<string, string>;

  /**
   * Library name for UMD builds (optional).
   */
  name?: string;

  /**
   * Additional external dependencies to exclude from the bundle.
   * Common dependencies like 'react' and 'react-dom' are already included.
   */
  external?: (string | RegExp)[];

  /**
   * Additional Vite configuration to merge.
   */
  viteConfig?: UserConfig;
}

/**
 * Vite configuration preset for vanilla TypeScript libraries.
 * Includes TypeScript declaration generation and ES module output.
 */
export function defineVanillaLibConfig(config: VanillaLibConfig): UserConfig {
  const { entry, name, external = [], viteConfig = {} } = config;

  return defineConfig({
    plugins: [
      dts({
        include: ['src/**/*'],
        exclude: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
      }),
      ...(viteConfig.plugins || []),
    ],
    build: {
      lib: {
        entry: typeof entry === 'string' ? resolve(process.cwd(), entry) : entry,
        ...(name && { name }),
        formats: ['es'],
      },
      rollupOptions: {
        external,
        output: {
          preserveModules: false,
        },
      },
      ...viteConfig.build,
    },
    ...viteConfig,
  });
}
