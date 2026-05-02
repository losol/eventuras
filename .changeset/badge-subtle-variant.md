---
"@eventuras/ratio-ui": minor
---

Add a `subtle` variant to `Badge` for use as a category tag or kicker that sits inside a card / list row without shouting. Outline pill on a quiet tinted background, mono-uppercase typography, status-tinted colors that mirror the existing filled variants.

```tsx
<Badge variant="subtle">Course</Badge>
<Badge variant="subtle" status="warning">Few seats</Badge>
```

Pairs with the existing filled variant — same `status` enum, same `Status`-keyed colors. Default remains `variant="filled"` so existing usages are unchanged. Use the subtle variant as the canonical "category tag" inside Strip / Card content where the badge supports the surface rather than competing with it.
