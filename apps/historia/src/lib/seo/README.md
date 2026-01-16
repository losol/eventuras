# SEO Utilities

Generic helpers for SEO metadata generation in Next.js applications.

## Features

- ✅ **Smart fallbacks** - Multi-level fallback chain for title, description, image
- ✅ **Multi-tenant aware** - Uses website domain for canonical URLs
- ✅ **Optimized images** - Automatically uses socialShare format (1200×630px)
- ✅ **Open Graph + Twitter** - Complete social media meta tags
- ✅ **Type-safe** - Full TypeScript support
- ✅ **Framework-agnostic** - Can be extracted to libs/ and reused

## Usage

### Generate Metadata in Next.js Page

```typescript
import { generateMeta } from '@/lib/seo';
import { getCurrentWebsite } from '@/lib/website';

export async function generateMetadata({
  params
}: {
  params: { slug: string }
}) {
  const doc = await fetchArticle(params.slug);
  const website = await getCurrentWebsite();

  return generateMeta({ doc, website });
}
```

### Without Website Context

```typescript
import { generateMeta } from '@/lib/seo';

export async function generateMetadata({ params }) {
  const doc = await fetchPage(params.slug);

  // Website parameter is optional
  return generateMeta({ doc });
}
```

### Custom Base URL

```typescript
return generateMeta({
  doc,
  website,
  baseUrl: 'https://custom-domain.com'
});
```

## Fallback Chain

### Title
1. `doc.meta.title` - Custom SEO title
2. `doc.title` - Content title
3. `website.meta.title` - Site-wide default
4. `"Historia"` - Hardcoded fallback

### Description
1. `doc.meta.description` - Custom SEO description
2. `doc.lead` - Article lead/excerpt
3. `doc.excerpt` - Alternative excerpt field
4. `website.meta.description` - Site-wide default

### Image
1. `doc.meta.image` - Custom social image
2. `doc.image` or `doc.featuredImage` - Content image
3. `website.meta.image` - Site-wide fallback

All images automatically use the optimal **socialShare** format (1200×630px) if available, with fallback to **landscape** or original.

## Utilities

### getImageURL

Extracts optimal image URL from Media object:

```typescript
import { getImageURL } from '@/lib/seo';

const imageUrl = getImageURL(mediaObject, 'https://example.com');
// Returns: https://example.com/media/image-socialShare.jpg
```

### extractImage

Finds image from various document field locations:

```typescript
import { extractImage } from '@/lib/seo';

const media = extractImage(doc);
// Checks: doc.meta.image → doc.image → doc.featuredImage
```

### isMediaObject

Type guard for Media objects:

```typescript
import { isMediaObject } from '@/lib/seo';

if (isMediaObject(doc.image)) {
  const url = doc.image.url;
}
```

## TypeScript

```typescript
import type { GenerateMetaOptions } from '@/lib/seo';

const options: GenerateMetaOptions = {
  doc: myDocument,
  website: currentWebsite,
  baseUrl: 'https://example.com',
};
```

## Future Enhancements

When moved to `libs/seo`:

- JSON-LD structured data generation
- Robots meta tag helpers
- Canonical URL utilities
- Sitemap helpers
- Schema.org markup builders

## Related

- [lib/payload-plugin-seo](../payload-plugin-seo/README.md) - Payload CMS SEO fields
