# Authentication State Machine

A robust, type-safe XState v5 state machine for managing authentication state in Next.js applications.

## Features

- ✅ **Explicit State Management** - All authentication states are explicitly modeled
- ✅ **Type-Safe** - Full TypeScript support for events, context, and state transitions
- ✅ **Prevents Impossible States** - State machine structure prevents invalid auth states
- ✅ **Session Monitoring** - Automatic polling of session status
- ✅ **Session Warning** - 30-second countdown before session expiration
- ✅ **Token Refresh** - Automatic token refresh handling
- ✅ **React Hooks** - Easy integration with React components
- ✅ **Configurable** - Customize intervals, timeouts, and admin roles
- ✅ **Comprehensive Logging** - Built-in structured logging for debugging

## Installation

This module is part of `@eventuras/fides-auth-next`. Make sure you have the required peer dependencies:

```bash
pnpm add @eventuras/fides-auth-next xstate @xstate/react
```

## Quick Start

### 1. Create Auth Machine Configuration

Create a file in your app (e.g., `src/auth/authMachine.ts`):

```typescript
import { createActor } from 'xstate';
import { createAuthMachine, createAuthHooks } from '@eventuras/fides-auth-next/state-machine';
import { getAuthStatus } from './getAuthStatus'; // Your server action

// Create the configured machine
const authMachine = createAuthMachine({
  checkAuthStatus: getAuthStatus,
  config: {
    sessionMonitorInterval: 30_000, // 30 seconds
    sessionWarningTimeout: 30_000,  // 30 seconds
    loggerNamespace: 'myapp:auth',
    adminRole: 'Admin',
  },
});

// Create the actor (running instance)
export const authService = createActor(authMachine);

// Create React hooks
export const { useAuthSelector, useAuthActions } = createAuthHooks(authService);
```

### 2. Implement Auth Status Checker

Create a server action that checks authentication status:

```typescript
'use server';

import { cookies } from 'next/headers';
import { validateSessionJwt } from '@eventuras/fides-auth-next/session';
import type { AuthStatus } from '@eventuras/fides-auth-next/state-machine';

export async function getAuthStatus(): Promise<AuthStatus> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session')?.value;

  if (!sessionCookie) {
    return { authenticated: false };
  }

  try {
    const session = await validateSessionJwt(sessionCookie);
    
    return {
      authenticated: true,
      user: {
        name: session.user.name,
        email: session.user.email,
        roles: session.user.roles,
      },
    };
  } catch {
    return { authenticated: false };
  }
}
```

### 3. Start Machine in Root Component

In your root `Providers` component:

```typescript
'use client';

import { useEffect } from 'react';
import { authService } from '@/auth/authMachine';

export default function Providers({ children }) {
  useEffect(() => {
    authService.start();
    return () => authService.stop();
  }, []);

  return <>{children}</>;
}
```

### 4. Use in Components

```typescript
import { useAuthSelector, useAuthActions } from '@/auth/authMachine';

export function MyComponent() {
  const { isAuthenticated, userName, isAdmin } = useAuthSelector();
  const { logout } = useAuthActions();

  if (!isAuthenticated) {
    return <a href="/api/login">Login</a>;
  }

  return (
    <div>
      <h1>Welcome, {userName}!</h1>
      {isAdmin && <a href="/admin">Admin Panel</a>}
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

## API Reference

### `createAuthMachine(options)`

Creates a configured authentication state machine.

**Parameters:**
- `options.checkAuthStatus` - Function that checks authentication status (required)
- `options.config.sessionMonitorInterval` - Polling interval in ms (default: 30000)
- `options.config.sessionWarningTimeout` - Warning timeout in ms (default: 30000)
- `options.config.loggerNamespace` - Logger namespace (default: 'fides:auth-machine')
- `options.config.adminRole` - Role name for admin detection (default: 'Admin')

**Returns:** XState StateMachine

### `createAuthHooks(authService)`

Creates React hooks for interacting with the auth machine.

**Parameters:**
- `authService` - XState Actor created with `createActor(authMachine)`

**Returns:** Object with `useAuthSelector` and `useAuthActions` hooks

### `useAuthSelector()`

Hook that returns current authentication state and computed values.

**Returns:**
```typescript
{
  isAuthenticated: boolean;
  isInitializing: boolean;
  isSessionWarning: boolean;
  isSessionExpired: boolean;
  isRefreshingToken: boolean;
  user: SessionUser | null;
  isAdmin: boolean;
  error: string | null;
  lastChecked: Date | null;
  userName: string | null;
  userEmail: string | null;
  userRoles: string[];
  currentState: string;
}
```

### `useAuthActions()`

Hook that returns functions to dispatch events to the machine.

**Returns:**
```typescript
{
  checkAuth: () => void;
  logout: () => void;
  dismissWarning: () => void;
  refreshToken: () => void;
  handleLoginSuccess: (user: SessionUser) => void;
  handleSessionExpired: () => void;
  handleSessionWarning: () => void;
}
```

## State Machine States

```
┌──────────────┐
│ initializing │ → Checking auth on app load
└──────────────┘
       ↓
┌──────────────────┐
│ notAuthenticated │ → User needs to log in
└──────────────────┘
       ↓
┌──────────────────────┐
│    authenticated     │
│  ┌───────────────┐   │
│  │    active     │   │ → Normal operation (30s polling)
│  └───────────────┘   │
│  ┌───────────────┐   │
│  │sessionWarning │   │ → 30-second countdown
│  └───────────────┘   │
│  ┌───────────────┐   │
│  │refreshingToken│   │ → Token refresh in progress
│  └───────────────┘   │
└──────────────────────┘
       ↓
┌──────────────┐
│sessionExpired│ → Must re-authenticate
└──────────────┘
```

## Events

| Event | Description |
|-------|-------------|
| `CHECK_AUTH` | Manually trigger auth status check |
| `AUTH_VALIDATED` | Auth check succeeded |
| `AUTH_FAILED` | Auth check failed |
| `SESSION_WARNING` | Session about to expire |
| `SESSION_EXPIRED` | Session has expired |
| `LOGOUT` | User initiated logout |
| `LOGIN_SUCCESS` | OAuth login completed |
| `REFRESH_TOKEN` | Trigger token refresh |
| `TOKEN_REFRESHED` | Token refresh succeeded |
| `TOKEN_REFRESH_FAILED` | Token refresh failed |
| `DISMISS_WARNING` | User dismissed session warning |

## Examples

### Handling Session Warning

```typescript
import { useAuthSelector, useAuthActions } from '@/auth/authMachine';

export function SessionWarningDialog() {
  const { isSessionWarning } = useAuthSelector();
  const { dismissWarning, handleSessionExpired } = useAuthActions();

  if (!isSessionWarning) return null;

  return (
    <dialog open>
      <h2>Your session is about to expire</h2>
      <p>You will be logged out in 30 seconds</p>
      <button onClick={dismissWarning}>Give me more time</button>
      <button onClick={() => {
        handleSessionExpired();
        window.location.href = '/api/login';
      }}>
        Login now
      </button>
    </dialog>
  );
}
```

### Admin-Only Content

```typescript
import { useAuthSelector } from '@/auth/authMachine';

export function AdminPanel() {
  const { isAdmin } = useAuthSelector();

  if (!isAdmin) {
    return <p>Access denied</p>;
  }

  return <div>Admin controls...</div>;
}
```

### OAuth Flow Integration

The machine automatically detects successful logins through the OAuth flow:

1. User clicks login → Auth0 redirects back to callback
2. Callback sets session cookie and redirects to app
3. App reloads → Machine starts in `initializing` state
4. Machine checks auth → Detects session → Transitions to `authenticated`

No manual event dispatching needed!

### Middleware Integration

Your Next.js middleware should:
1. Validate session JWT on each request
2. Refresh tokens when needed
3. Set `session-warning` cookie when session is about to expire

The `SessionWarningOverlay` component can bridge this cookie to the machine:

```typescript
useEffect(() => {
  const checkWarning = () => {
    const hasCookie = document.cookie.includes('session-warning=');
    
    if (hasCookie && !isSessionWarning) {
      handleSessionWarning();
      // Clean up cookie
      document.cookie = 'session-warning=; path=/; max-age=0';
    }
  };

  const interval = setInterval(checkWarning, 1000);
  return () => clearInterval(interval);
}, [isSessionWarning, handleSessionWarning]);
```

## Testing

```typescript
import { createActor } from 'xstate';
import { createAuthMachine } from '@eventuras/fides-auth-next/state-machine';
import { describe, it, expect, vi } from 'vitest';

describe('Auth State Machine', () => {
  it('should start in initializing state', () => {
    const machine = createAuthMachine({
      checkAuthStatus: vi.fn(() => Promise.resolve({ authenticated: false })),
    });
    
    const actor = createActor(machine);
    expect(actor.getSnapshot().value).toBe('initializing');
  });

  it('should transition to authenticated on login success', () => {
    const machine = createAuthMachine({
      checkAuthStatus: vi.fn(() => Promise.resolve({ authenticated: false })),
    });
    
    const actor = createActor(machine);
    actor.start();
    
    actor.send({
      type: 'LOGIN_SUCCESS',
      user: { name: 'Test', email: 'test@test.com', roles: [] },
    });
    
    expect(actor.getSnapshot().value).toEqual({ authenticated: 'active' });
  });
});
```

## Migration from Direct Polling

If you're migrating from a component-based polling approach:

**Before:**
```typescript
function useAuthStatus() {
  const [status, setStatus] = useState(null);
  
  useEffect(() => {
    const fetchStatus = async () => {
      const result = await getAuthStatus();
      setStatus(result);
    };
    
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);
  
  return status;
}
```

**After:**
```typescript
import { useAuthSelector } from '@/auth/authMachine';

function MyComponent() {
  const { isAuthenticated, user } = useAuthSelector();
  // Machine handles polling automatically!
}
```

## License

MIT
