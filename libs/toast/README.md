# @eventuras/toast

Toast notification system for React applications built with XState.

## Installation

```bash
npm install @eventuras/toast
# or
yarn add @eventuras/toast
# or
pnpm add @eventuras/toast
```

### Peer Dependencies

Make sure you have the required peer dependencies installed:

```bash
pnpm install xstate uuid
```

## Quick Start

### 1. Setup the Provider

Wrap your app with the `ToastsContext.Provider` and include the `ToastRenderer` in Providers.tsx

```tsx
"use client";

import { ToastsContext, ToastRenderer } from "@eventuras/toast";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastsContext.Provider>
      <ToastRenderer />
      {children}
    </ToastsContext.Provider>
  );
}
```

### 2. Use the Hook

Import and use the `useToast` hook in your components:

```tsx
import { useToast } from "@eventuras/toast";

function MyComponent() {
  const toast = useToast();

  const handleSuccess = () => {
    toast.success("Operation completed successfully!");
  };

  const handleError = () => {
    toast.error("Something went wrong!");
  };

  const handleInfo = () => {
    toast.info("Here's some information");
  };

  return (
    <div>
      <button onClick={handleSuccess}>Success Toast</button>
      <button onClick={handleError}>Error Toast</button>
      <button onClick={handleInfo}>Info Toast</button>
    </div>
  );
}
```

## API Reference

### `useToast()`

Returns a toast function with convenience methods attached.

#### Basic Usage

```tsx
const toast = useToast();

// Full control
const toastId = toast({
  message: "Custom message",
  type: ToastType.SUCCESS,
  expiresAfter: 5000,
});
```

#### Convenience Methods

```tsx
// Success toast (green)
toast.success("Success message", options);

// Error toast (red)
toast.error("Error message", options);

// Info toast (blue)
toast.info("Info message", options);

// Remove a specific toast
toast.remove(toastId);
```

#### Options

All convenience methods accept an optional `options` parameter:

```tsx
interface ToastOptions {
  expiresAfter?: number; // Duration in milliseconds (default: 10000)
}

toast.success("Message", { expiresAfter: 3000 });
```

### Toast Types

```tsx
import { ToastType } from "@eventuras/toast";

ToastType.SUCCESS; // 'success'
ToastType.ERROR; // 'error'
ToastType.INFO; // 'info'
```

## Advanced Usage

### Manual Toast Management

```tsx
const toast = useToast();

// Add a toast and store its ID
const toastId = toast.success("Removable toast");

// Remove it manually before it expires
setTimeout(() => {
  toast.remove(toastId);
}, 2000);
```

### Custom Expiration

```tsx
const toast = useToast();

// Toast that never expires
toast.info("Persistent message", { expiresAfter: -1 });

// Quick toast (1 second)
toast.success("Quick message", { expiresAfter: 1000 });

// Long toast (30 seconds)
toast.error("Important error", { expiresAfter: 30000 });
```

## Components

### `ToastRenderer`

The main component that renders all active toasts. Must be placed inside `ToastsContext.Provider`.

```tsx
import { ToastRenderer } from "@eventuras/toast";

// Usually placed in your root layout
<ToastRenderer />;
```

### `ToastsContext`

XState context provider that manages toast state.

```tsx
import { ToastsContext } from "@eventuras/toast";

<ToastsContext.Provider>{/* Your app */}</ToastsContext.Provider>;
```

## TypeScript

The library is fully typed. Import types as needed:

```tsx
import { Toast, ToastType } from "@eventuras/toast";

const myToast: Toast = {
  id: "unique-id",
  message: "Hello world",
  type: ToastType.SUCCESS,
  expiresAfter: 5000,
};
```

## Examples

### Integration with Forms

```tsx
import { useToast } from "@eventuras/toast";

function ContactForm() {
  const toast = useToast();

  const handleSubmit = async (data) => {
    try {
      await submitForm(data);
      toast.success("Message sent successfully!");
    } catch (error) {
      toast.error("Failed to send message. Please try again.");
    }
  };

  // ... rest of component
}
```

### Integration with API Calls

```tsx
const toast = useToast();

const { mutate: createUser } = useMutation({
  mutationFn: createUserAPI,
  onSuccess: () => {
    toast.success("User created successfully!");
  },
  onError: (error) => {
    toast.error(`Failed to create user: ${error.message}`);
  },
});
```

## License

GPL

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
