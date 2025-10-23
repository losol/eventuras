import { defineReactLibConfig } from '@eventuras/vite-config/react-lib';

export default defineReactLibConfig({
  entry: 'src/index.tsx',
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
