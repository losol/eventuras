// vite-env.d.ts
/// <reference types="vite/client" />

// allow raw‑text imports of Markdown files
declare module '*.md?raw' {
  const content: string;
  export default content;
}
