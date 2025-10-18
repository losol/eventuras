import { defineConfig, type UserConfig } from 'vite';
import { defineReactLibConfig, type ReactLibConfig } from './react-lib.ts';

export interface NextLibConfig extends Omit<ReactLibConfig, 'external'> {
  /**
   * Additional external dependencies beyond the Next.js defaults.
   * Next.js, next/image, and next/link are already included.
   */
  external?: (string | RegExp)[];
}

/**
 * Vite configuration preset for Next.js-compatible React libraries.
 * Extends the React library config with Next.js-specific externals and defaults.
 */
export function defineNextLibConfig(config: NextLibConfig): UserConfig {
  const { external = [], ...reactConfig } = config;

  // Next.js externals - include all next/* paths to avoid bundling internal modules
  const nextExternals = [
    'next',
    'next/image',
    'next/link',
    'next/navigation',
    'next/router',
    'next/headers',
    /^next\//,  // Externalize all next/* imports
  ];

  return defineReactLibConfig({
    ...reactConfig,
    external: [...nextExternals, ...external],
    // Next.js libraries should always preserve client directives
    preserveUseClientDirectives: true,
  });
}
