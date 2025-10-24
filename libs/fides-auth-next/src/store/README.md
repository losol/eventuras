# XState Store for Authentication

Type-safe authentication state management using XState Store.

## Quick Start

```typescript
import {
  createAuthStore,
  createAuthStoreHooks,
} from "@eventuras/fides-auth-next/store";

export const authStore = createAuthStore({
  checkAuthStatus: getAuthStatus,
  config: { adminRole: "Admin" },
});

export const { useAuthStore, useAuthActions } = createAuthStoreHooks(authStore);
```

## Features

- ✅ Simple data-focused state management
- ✅ Automatic session monitoring
- ✅ Type-safe state and actions
- ✅ React hooks integration
- ✅ Configurable polling

## API

### `useAuthStore()`

Returns current state:

```typescript
{
  user: SessionUser | null;
  isAdmin: boolean;
  isAuthenticated: boolean;
  error: string | null;
  lastChecked: Date | null;
  isInitializing: boolean;
}
```

### `useAuthActions()`

Returns actions:

```typescript
{
  loginSuccess: (user: SessionUser) => void;
  logout: () => void;
  sessionExpired: () => void;
  authSuccess: (user: SessionUser) => void;
  authFailed: (error?: string) => void;
}
```

### Helper Functions

```typescript
// Initialize auth
initializeAuth(authStore, getAuthStatus);

// Start monitoring (returns cleanup)
const cleanup = startSessionMonitor(authStore, getAuthStatus, {
  interval: 30_000,
  onSessionExpired: () => {},
});
```

## Usage Example

```typescript
export function MyComponent() {
  const { isAuthenticated, user } = useAuthStore();
  const { logout } = useAuthActions();

  if (!isAuthenticated) return <LoginButton />;

  return (
    <div>
      <p>Welcome, {user?.name}!</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

See [Setup Guide](../../SETUP_GUIDE.md) for complete examples.
