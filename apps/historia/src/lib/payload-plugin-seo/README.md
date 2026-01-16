# Payload SEO Plugin (Internal)

Simple, framework-agnostic SEO meta fields for Payload CMS collections.

## Features

- ✅ **Title, Description, Image** - Essential SEO meta fields
- ✅ **Localized** - Full i18n support for title/description
- ✅ **Character limits** - 60 chars for title, 160 for description
- ✅ **Smart fallbacks** - Empty fields auto-generate from content
- ✅ **Type-safe** - Full TypeScript support
- ✅ **Tab UI** - Clean separation in admin panel
- ✅ **Zero dependencies** - No external plugins

## Usage

### Add SEO Tab to Collection

```typescript
import { seoTab } from '@/lib/payload-plugin-seo';

export const Articles: CollectionConfig = {
  slug: 'articles',
  fields: [
    // ... your content fields
    seoTab('no'), // 'en' or 'no' for localized labels
  ],
};
```

### Add Meta Fields Inline (No Tab)

```typescript
import { metaField } from '@/lib/payload-plugin-seo';

export const Pages: CollectionConfig = {
  slug: 'pages',
  fields: [
    // ... other fields
    metaField, // Adds meta group inline
  ],
};
```

## TypeScript Types

```typescript
import type { SEOFields, SEODocument } from '@/lib/payload-plugin-seo';

// Use in your document interfaces
interface MyDocument extends SEOFields {
  title: string;
  // ... other fields
}

// Or use the pre-built SEODocument type
const doc: SEODocument = {
  title: 'My Article',
  meta: {
    title: 'Custom SEO Title',
    description: 'Custom description',
    image: mediaObject,
  },
};
```

## Field Structure

```typescript
{
  meta: {
    title: string;        // Max 60 chars, localized
    description: string;  // Max 160 chars, localized
    image: Media;         // Upload relation to 'media' collection
  }
}
```

## Best Practices

### Image Formats

Use the **socialShare** format (1200×630px) for optimal social media display:

```typescript
// In your Next.js metadata generation
const imageUrl =
  doc.meta?.image?.sizes?.socialShare?.url ||  // Optimal format
  doc.meta?.image?.sizes?.landscape?.url ||    // Fallback
  doc.meta?.image?.url;                        // Original
```

### Fallback Chain

Recommended fallback order in `generateMetadata`:

1. **doc.meta.title** → Custom SEO title
2. **doc.title** → Content title
3. **website.meta.title** → Site-wide default

Same for description and image.

## Future Plans

When this library is mature and tested in production, it can be:

- Moved to monorepo `libs/payload-seo`
- Published as `@eventuras/payload-seo`
- Reused across multiple Payload CMS projects
- Enhanced with character counters, auto-generate hooks, robots fields

## Related

- [lib/seo](../seo/README.md) - Generic SEO utilities for Next.js metadata generation
