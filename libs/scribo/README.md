# Scribo markdown editor

Markdown editor built on [Lexical framework](https://lexical.dev/). Intended to be used as part of eventuras, but also packed as a standalone component. Scribo is a WYSIWYG editor with markdown export.

The editor should provide simple and intuitive editing of markdown text, with a focus on the most common use cases.

Test the [scribo editor online demo](https://scribo.losol.no/).

> **Lexical version**: we are keeping the lexical version in sync with the [lexical version used in Payload CMS](https://github.com/payloadcms/payload/blob/main/packages/richtext-lexical/package.json), to prevent multiple versions making trouble.

## Installation

```bash
pnpm add @eventuras/scribo
```

## Usage

**Important**: You must import the CSS file for Scribo to display correctly:

### MarkdownEditor (WYSIWYG Editor)

```tsx
import "@eventuras/scribo/style.css";
import { MarkdownEditor } from "@eventuras/scribo";

function MyComponent() {
  return <MarkdownEditor defaultValue="# Hello World" />;
}
```

### MarkdownInput (Form-ready Input)

For use with native HTML forms (FormData API):

```tsx
import "@eventuras/scribo/style.css";
import { MarkdownInput } from "@eventuras/scribo";

function MyForm() {
  return (
    <form>
      <MarkdownInput
        name="description"
        label="Description"
        placeholder="Enter markdown..."
        defaultValue="# Hello"
        maxLength={500}
        className="mb-4"
        labelClassName="font-bold"
        editorClassName="border rounded"
        errorClassName="text-red-500"
      />
      <button type="submit">Submit</button>
    </form>
  );
}
```

The `MarkdownInput` component is framework-agnostic and provides:

- Hidden input for FormData submission
- Optional label and validation
- Flexible styling via className props
- Character limit validation

### Peer Dependencies

Scribo requires the following peer dependencies:

```bash
pnpm add react react-dom lexical @lexical/code @lexical/hashtag @lexical/link @lexical/list @lexical/mark @lexical/markdown @lexical/overflow @lexical/react @lexical/rich-text @lexical/selection @lexical/table @lexical/utils prismjs
```

**Prism.js for syntax highlighting:**  
Scribo uses Prism.js for code syntax highlighting but does not bundle it. You need to install `prismjs` and import the language grammars you need in your application.

Example:

```tsx
import "prismjs";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-css";
// Import other languages as needed
```

## Develop

To start developing Scribo, run the following commands:

```bash
pnpm install
vite dev
```

## Release

Quick release process:

```bash
# 1. Create changeset (choose one)
pnpm changeset                 # Manual (recommended)
pnpm changeset:suggest         # Auto-generate from commits

# 2. Version package
pnpm changeset:version

# 3. Commit and push (create PR to main)
git checkout -b release/scribo-v0.x.x
git add .
git commit -m "chore(scribo): release v0.x.x"
git push origin release/scribo-v0.x.x

# 4. Merge PR to main, then automated workflow will publish to npm and create GitHub release
```

For detailed release instructions, including setup and troubleshooting, see [RELEASE.md](./RELEASE.md).

## Credits

Scribo is built on the [Lexical framework](https://lexical.dev/), and most of the code in the repo is done by [Meta under MIT license](https://github.com/facebook/lexical).

## Learn More

- [Lexical](https://lexical.dev/)
