import { defineReactLibConfig } from '@eventuras/vite-config/react-lib';
import { resolve } from 'path';

// Check build mode
const buildSite = process.env.BUILD_SITE === 'true';

export default buildSite
  ? // Build demo site
  {
    build: {
      outDir: 'dist/site',
    },
  }
  : // Build library
  defineReactLibConfig({
    entry: 'src/main.tsx',
    useSWC: false,
    external: [
      // Externalize all Lexical packages to avoid bundling them
      'lexical',
      '@lexical/code',
      '@lexical/hashtag',
      '@lexical/history',
      '@lexical/link',
      '@lexical/list',
      '@lexical/markdown',
      '@lexical/mark',
      '@lexical/overflow',
      '@lexical/react',
      '@lexical/rich-text',
      '@lexical/selection',
      '@lexical/text',
      '@lexical/utils',
      // Also externalize any sub-exports from @lexical/react
      /^@lexical\//,
      // Externalize Prism.js to avoid bundling all language grammars
      'prismjs',
      /^prismjs\//,
    ],
  });

