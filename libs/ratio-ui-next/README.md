# @eventuras/ratio-ui-next

Next.js-specific components for the Eventuras Ratio UI library.

This package provides Next.js optimized wrappers for Ratio UI components that integrate seamlessly with Next.js features like:

- `next/image` for optimized image loading
- `next/link` for client-side navigation

## Installation

```bash
pnpm add @eventuras/ratio-ui-next
```

## Usage

### Image

```tsx
import { Image } from '@eventuras/ratio-ui-next/Image';

<Image src="/photo.jpg" alt="Description" width={800} height={600} />
```

### Link

```tsx
import { Link } from '@eventuras/ratio-ui-next/Link';

<Link href="/about">About Us</Link>
```

## Dependencies

This package depends on:

- `@eventuras/ratio-ui` - Core UI components
- `next` - Next.js framework (peer dependency)
- `react` - React library (peer dependency)
