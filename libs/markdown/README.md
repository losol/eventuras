# Eventuras Markdown Input

This package provides Markdown components for React.

## Usage

```tsx
import { MarkdownContent } from '@eventuras/markdown';

// Basic usage (only relative links allowed)
<MarkdownContent markdown="Hello **world**!" />

// Allow external links and images
<MarkdownContent 
  markdown="Check out [example.com](https://example.com)" 
  allowExternalLinks={true}
/>
```

## Security Features

By default, the component:

- Strips invisible characters and control characters
- Blocks raw HTML (unless `enableRawHtml={true}`)
- **Blocks external URLs** in links and images (only relative URLs like `/events` are allowed)
- Blocks `javascript:` and `data:` protocols

### Allowing External Links

To allow external URLs (e.g., `https://example.com`), set `allowExternalLinks={true}`:

```tsx
<MarkdownContent 
  markdown="[Google](https://google.com)" 
  allowExternalLinks={true}
/>
```

Without this prop, external links will be rendered as plain text.

## Props

- `markdown?: string | null` - The markdown content to render
- `heading?: string` - Optional heading to display above the content
- `keepInvisibleCharacters?: boolean` - Keep invisible/control characters (default: `false`)
- `enableRawHtml?: boolean` - Allow raw HTML in markdown (unsafe, default: `false`)
- `allowExternalLinks?: boolean` - Allow external/absolute URLs in links and images (default: `false`)
