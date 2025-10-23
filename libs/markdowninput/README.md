# Eventuras Markdown Input

This package provides Markdown form input for React using the Scribo editor. Works with native HTML forms and the FormData API - no form library required!

## Installation

```bash
pnpm add @eventuras/markdowninput
```

### Peer Dependencies

This package requires the following peer dependencies:

```bash
pnpm add react react-dom
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

The markdown input works with native HTML forms using the FormData API. The component includes a hidden input field that stores the markdown value and will be submitted with the form.

```tsx
import { MarkdownInput } from '@eventuras/markdowninput';

function MyForm() {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const markdown = formData.get('description') as string;
    console.log('Markdown:', markdown);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <MarkdownInput
        name="description"
        label="Description"
        placeholder="Enter your markdown here..."
        maxLength={1000}
      />
      <button type="submit">Submit</button>
    </form>
  );
}
```

### Props

- `name` (required): The name attribute for the form field
- `label` (optional): Label text displayed above the editor
- `placeholder` (optional): Placeholder text shown in the empty editor
- `defaultValue` (optional): Initial markdown content
- `maxLength` (optional): Maximum character limit (validates plain text length)
- `id` (optional): Custom ID for the input (defaults to `name`)

## Features

- ✅ Works with native HTML forms (FormData API)
- ✅ No form library dependencies
- ✅ Markdown editor with rich formatting toolbar
- ✅ Character limit validation
- ✅ Support for links, lists, code blocks, and more
