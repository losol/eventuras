---
"@eventuras/ratio-ui": major
---

Add accessible toast system at `@eventuras/ratio-ui/toast`, replacing the standalone `@eventuras/toast` package.

## Why

The previous `@eventuras/toast` package was a custom XState machine rendering plain `<div>`s. It lacked landmark navigation, focus management, pause-on-hover, and proper screen reader announcements. We've rewritten it on top of [React Aria's toast primitives](https://react-aria.adobe.com/react-aria/Toast.html) and folded the package into ratio-ui so all UI lives in one place.

## What changed

- **New export path**: `@eventuras/ratio-ui/toast`. The standalone `@eventuras/toast` package has been removed.
- **Accessibility**: toast region is now a landmark (navigate with F6 / Shift+F6), focus is managed on close, timers pause on hover/focus, screen readers announce content correctly.
- **Animations**: toasts slide in/out via CSS animations targeting react-aria's `data-entering` / `data-exiting` attributes.
- **No provider required**: `ToastsContext` is removed. Toast state lives in a singleton `toastQueue`. Just render `<ToastRenderer />` once at the app root.
- **Dependencies**: `xstate`, `@xstate/react`, and `uuid` are no longer needed for toasts.

## Public API

The `useToast()` hook signature is unchanged:

```ts
toast.success(message, options?): string
toast.error(message, options?): string
toast.warning(message, options?): string
toast.info(message, options?): string
toast.remove(key): void
```

Each method returns a string `key` that can be passed to `toast.remove()` for programmatic dismissal.

## Migration

```diff
- import { useToast } from '@eventuras/toast';
+ import { useToast } from '@eventuras/ratio-ui/toast';

- import { ToastRenderer, ToastsContext } from '@eventuras/toast';
+ import { ToastRenderer } from '@eventuras/ratio-ui/toast';
```

Providers that wrapped children in `<ToastsContext.Provider>` must drop the wrapper:

```diff
- <ToastsContext.Provider>
-   <ToastRenderer />
-   {children}
- </ToastsContext.Provider>
+ <ToastRenderer />
+ {children}
```

Remove `@eventuras/toast` from your app's `package.json` dependencies.
