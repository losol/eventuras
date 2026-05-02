---
"@eventuras/ratio-ui": minor
---

`Section.Link` now accepts an `as?: React.ElementType` prop so consumers can render through a framework-specific Link component (Next.js, TanStack, etc) instead of the default plain `<a>`. Use this for internal routes to keep client-side navigation and prefetching:

```tsx
import { Link } from '@eventuras/ratio-ui-next/Link';

<Section.Header>
  <Section.Title>Featured</Section.Title>
  <Section.Link as={Link} href="/collections/foo">See all</Section.Link>
</Section.Header>
```

Default behaviour is unchanged when `as` is omitted.
