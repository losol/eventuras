# `@eventuras/typescript-config`

Shared TypeScript configurations used across Eventuras projects.

## Presets

| File                  | Use for                                                    |
| --------------------- | ---------------------------------------------------------- |
| `base.json`           | Default preset — strict, modern Node/ESM baseline.         |
| `library.json`        | Libraries that emit declarations and JS.                   |
| `react-library.json`  | React component libraries (JSX, DOM lib).                  |
| `nextjs.json`         | Next.js apps.                                              |
| `node.json`           | Node-only apps and scripts.                                |

## Usage

Install:

```sh
npm install -D @eventuras/typescript-config
```

Extend from your `tsconfig.json`:

```json
{
  "extends": "@eventuras/typescript-config/base.json",
  "include": ["src"]
}
```
