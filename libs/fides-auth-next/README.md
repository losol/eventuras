# @eventuras/fides-auth-next

Next.js authentication with XState Store state management.

## Installation

```bash
pnpm add @eventuras/fides-auth-next @xstate/store
```

## Quick Start

```typescript
// 1. Create store
import {
  createAuthStore,
  createAuthStoreHooks,
} from "@eventuras/fides-auth-next/store";

export const authStore = createAuthStore({
  checkAuthStatus: getAuthStatus,
  config: { adminRole: "Admin" },
});

export const { useAuthStore, useAuthActions } = createAuthStoreHooks(authStore);

// 2. Initialize in app
useEffect(() => {
  initializeAuth(authStore, getAuthStatus);
  return startSessionMonitor(authStore, getAuthStatus, { interval: 30_000 });
}, []);

// 3. Use in components
const { isAuthenticated, user, isAdmin } = useAuthStore();
const { logout } = useAuthActions();
```

## Features

- **XState Store**: Simple auth state management with automatic session monitoring
- **Cookie Helpers**: Server-side cookie operations
- **Session Management**: High-level session functions
- **OAuth**: Complete OAuth flow with PKCE
- **TypeScript**: Full type safety

## Core Functions

```typescript
// Server-side
import {
  getCurrentSession,
  createAndPersistSession,
  clearCurrentSession,
  setSessionCookie,
  getSessionCookie,
} from "@eventuras/fides-auth-next";

// Client-side
import { useAuthStore, useAuthActions } from "./auth-store";
```

## Environment

```bash
SESSION_SECRET=your-32-byte-hex-secret  # openssl rand -hex 32
```

## Documentation

- [Store API](./src/store/) - XState Store details
- [Setup Guide](./SETUP_GUIDE.md) - Complete walkthrough
