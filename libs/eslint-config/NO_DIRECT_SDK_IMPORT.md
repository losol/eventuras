# Custom ESLint Rule: `eventuras/no-direct-event-sdk-import`

## Overview

Added a custom ESLint rule to prevent direct imports from `@eventuras/event-sdk` in the `apps/web` codebase. This ensures proper client configuration and prevents runtime errors.

## Problem

Direct imports from `@eventuras/event-sdk` use an unconfigured global client, which causes:

- `fetch failed` errors with `ECONNREFUSED 127.0.0.1:5001`
- Missing authentication tokens
- Incorrect base URLs in production

## Rule Details

The rule `eventuras/no-direct-event-sdk-import` ensures that:

- SDK functions are imported from configured wrapper modules
- Authenticated pages use `@/lib/eventuras-sdk`
- Public/ISR pages use `@/lib/eventuras-public-sdk`
- The SDK client is properly configured before any API calls

## Auto-fix Support

This rule includes auto-fix functionality. Run:

```bash
pnpm lint --fix
```

ESLint will automatically:

- Convert `@eventuras/event-sdk` → `@/lib/eventuras-sdk` (for authenticated pages)
- Convert `@eventuras/event-sdk` → `@/lib/eventuras-public-sdk` (for public/ISR pages)

## Examples

### ❌ Incorrect

```tsx
// Direct import - client not configured!
import { getV3EventsById } from '@eventuras/event-sdk';

export default async function EventPage() {
  const event = await getV3EventsById({ path: { id: 1 } });
  // ❌ Error: fetch failed, ECONNREFUSED 127.0.0.1:5001
}
```

### ✅ Correct - Authenticated Pages

```tsx
// Import from configured wrapper
import { getV3EventsById } from '@/lib/eventuras-sdk';

export default async function EventPage() {
  const event = await getV3EventsById({ path: { id: 1 } });
  // ✅ Uses configured client with auth tokens
}
```

### ✅ Correct - Public/ISR Pages

```tsx
// Import from public wrapper
import { publicClient, getV3Events } from '@/lib/eventuras-public-sdk';

export const revalidate = 300; // ISR

export default async function PublicEventsPage() {
  const events = await getV3Events({
    client: publicClient, // Explicitly pass public client
    query: { ... }
  });
  // ✅ Uses public client (no auth, ISR-safe)
}
```

## When the Rule Applies

- **Applies to:** All files in `apps/web/src`
- **Excludes:**
  - Wrapper modules themselves (`eventuras-sdk.ts`, `eventuras-client.ts`, etc.)
  - Files outside `apps/web/src`

## Smart Auto-fix

The rule is smart about suggesting the right wrapper:

- Files in `(public)` or `(frontpage)` route groups → suggests `@/lib/eventuras-public-sdk`
- All other files → suggests `@/lib/eventuras-sdk`

## Implementation Files

- `libs/eslint-config/rules/no-direct-event-sdk-import.js` - Rule implementation
- `libs/eslint-config/rules/index.js` - Plugin export
- `libs/eslint-config/base.js` - Configuration integration
- `apps/web/src/lib/eventuras-sdk.ts` - Authenticated SDK wrapper
- `apps/web/src/lib/eventuras-public-sdk.ts` - Public SDK wrapper

## Migration

To migrate existing code:

```bash
cd apps/web
pnpm lint --fix
```

This will automatically update all direct SDK imports to use the appropriate wrapper.

## Related

See also: `CUSTOM_RULE.md` for the `no-invalid-testid` rule.
