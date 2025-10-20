# Eventuras Markdown Input

This package provides Markdown form input for React using the Scribo editor.

## Installation

```bash
pnpm add @eventuras/markdowninput
```

### Peer Dependencies

This package requires the following peer dependencies:

```bash
pnpm add react react-dom react-hook-form prismjs
```

**Prism.js for syntax highlighting:**  
The markdown editor uses Prism.js for code syntax highlighting but does not bundle it. You need to install `prismjs` and import the language grammars you need in your application.

Example:

```tsx
import 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-markdown';
// Import other languages as needed
```

## Usage

The markdown input integrates with react-hook-form and provides a rich text editor for markdown content.

```tsx
import { MarkdownInput } from '@eventuras/markdowninput';
import { useForm } from 'react-hook-form';

function MyForm() {
  const { control } = useForm();
  
  return (
    <MarkdownInput
      name="description"
      control={control}
      label="Description"
    />
  );
}
```
