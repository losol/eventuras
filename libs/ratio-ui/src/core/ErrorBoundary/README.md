# ErrorBoundary

A class-based React error boundary that catches render-time errors in its descendants and shows a fallback instead of letting the error propagate to the nearest route-level boundary (`error.tsx` in Next.js).

Use it to isolate fragile sub-trees so a single deep crash doesn't take down the surrounding page.

```tsx
import { ErrorBoundary } from '@eventuras/ratio-ui/core/ErrorBoundary';

<ErrorBoundary>
  <FlakyChild />
</ErrorBoundary>
```

With no `fallback` prop, the built-in `ErrorBoundary.DefaultFallback` renders an inline `ErrorBlock` with a generic message and a "Try again" button that calls `reset`. The raw `error.message` is intentionally not shown — it can leak implementation details or user data. Write a custom `fallback` if you need to surface details (typically gated behind a dev flag).

## What it does (and doesn't) catch

Catches:

- Render-time throws in descendants (during the React render phase).
- Throws inside lifecycle methods (`useEffect`, `componentDidMount`, etc.) of descendants.

Does **not** catch:

- Errors in event handlers — wrap them in `try/catch` yourself.
- Async callbacks (`setTimeout`, `Promise.then`) — same.
- SSR errors — error boundaries are a client-side React feature.
- Errors thrown by the boundary itself.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | — | Sub-tree to protect |
| `fallback` | `ReactNode \| ({ error, reset }) => ReactNode` | `ErrorBoundary.DefaultFallback` | UI shown when a child throws |
| `resetKeys` | `ReadonlyArray<unknown>` | — | Boundary resets when any key changes (`Object.is` compare) |
| `onError` | `(error, info) => void` | — | Side-effect hook for logging / Sentry |

## Custom fallback

Pass a static `ReactNode`:

```tsx
<ErrorBoundary
  fallback={<Panel variant="alert" status="error">Couldn't load this section.</Panel>}
>
  <FlakyChild />
</ErrorBoundary>
```

Or a render function for access to `error` and `reset`:

```tsx
<ErrorBoundary
  fallback={({ error, reset }) => (
    <div>
      <p>{error.message}</p>
      <Button onClick={reset}>Retry</Button>
    </div>
  )}
>
  <FlakyChild />
</ErrorBoundary>
```

## Resetting

The boundary resets in two ways:

1. **`reset()` is called** — typically from inside a render-function fallback or via `ErrorBoundary.DefaultFallback`'s "Try again" button. The error state clears and `children` re-renders.
2. **`resetKeys` change** — useful when the parent already has UI for retrying (e.g. a route key, a query key). When any value in the array changes, the boundary clears its error.

```tsx
<ErrorBoundary resetKeys={[pathname]}>
  <Page />
</ErrorBoundary>
```

## Logging

`onError` runs in `componentDidCatch`. Plug it into your logger and Sentry:

```tsx
<ErrorBoundary
  onError={(error, info) => {
    logger.error({ err: error, componentStack: info.componentStack }, 'Editor crashed');
    Sentry.captureException(error, {
      tags: { section: 'admin', component: 'MarkdownInput' },
      extra: { componentStack: info.componentStack },
    });
  }}
>
  <MarkdownInput />
</ErrorBoundary>
```

## Server vs client

The component file has no `'use client'` directive — ratio-ui is framework-agnostic. The consumer's `'use client'` file imports it. In Next.js App Router that means: put `<ErrorBoundary>` inside any file marked `'use client'`, or inside a Client Component sub-tree.

Server Components cannot use error boundaries — for SSR errors, use Next.js's `error.tsx` route boundaries.
