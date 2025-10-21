# Scribo markdown editor

Markdown editor built on [Lexical framework](https://lexical.dev/). Intended to be used as part of eventuras, but also packed as a standalone component. Scribo is a WYSIWYG editor with markdown export.

The editor should provide simple and intuitive editing of markdown text, with a focus on the most common use cases.

Test the [scribo editor online demo](https://scribo.losol.no/).

> **Lexical version**: we are keeping the lexical version in sync with the [lexical version used in Payload CMS](https://github.com/payloadcms/payload/blob/main/packages/richtext-lexical/package.json), to prevent multiple versions making trouble.

## Installation

```bash
pnpm add @eventuras/scribo
```

### Peer Dependencies

Scribo requires the following peer dependencies:

```bash
pnpm add react react-dom lexical @lexical/code @lexical/hashtag @lexical/link @lexical/list @lexical/mark @lexical/markdown @lexical/overflow @lexical/react @lexical/rich-text @lexical/selection @lexical/table @lexical/utils prismjs
```

**Prism.js for syntax highlighting:**  
Scribo uses Prism.js for code syntax highlighting but does not bundle it. You need to install `prismjs` and import the language grammars you need in your application.

Example:

```tsx
import 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-css';
// Import other languages as needed
```

## Develop

To start developing Scribo, run the following commands:

```bash
pnpm install
vite dev
```

## Publish

To publish a new version of the package:

1. Update version number in package.json
1. `npm run build`
1. `npm login --scope @eventuras --auth-type web`
1. `npm publish --access public`

## Credits

Scribo is built on the [Lexical framework](https://lexical.dev/), and most of the code in the repo is done by [Meta under MIT license](https://github.com/facebook/lexical).

## Learn More

- [Lexical](https://lexical.dev/)

