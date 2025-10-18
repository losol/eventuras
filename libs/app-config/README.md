# @eventuras/app-config

Declarative environment configuration for Eventuras applications.

## Overview

`@eventuras/app-config` provides a centralized, type-safe way to manage environment variables across all Eventuras applications. Instead of manually validating env vars in code, you declare them in an `app.config.json` file.

## Features

- ✅ **Declarative**: Define all env vars in a single JSON file
- ✅ **Type-safe**: Automatic type conversion and validation
- ✅ **Self-documenting**: Built-in descriptions for each variable
- ✅ **Validation**: Runtime validation with helpful error messages
- 7. **Defaults**: Built-in support for default values
8. **Consistent**: Uses @eventuras/vite-config for building

## Development

```bash
# Build the library
pnpm build

# Type check
pnpm typecheck

# Lint
pnpm lint
```

## License
- ✅ **Schema**: JSON Schema for IDE autocomplete and validation

## Installation

```bash
pnpm add @eventuras/app-config
```

## Usage

### 1. Create `app.config.json`

Create an `app.config.json` file in your app's root directory:

```json
{
  "$schema": "https://eventuras.dev/schema/app-config.schema.json",
  "name": "@eventuras/web",
  "type": "app",
  "description": "Main web frontend for Eventuras",
  "env": {
    "NEXT_PUBLIC_API_BASE_URL": {
      "required": true,
      "client": true,
      "type": "url",
      "description": "Base URL for the Eventuras API"
    },
    "NEXT_PUBLIC_ORGANIZATION_ID": {
      "required": false,
      "client": true,
      "type": "string",
      "description": "Organization ID for scoping configuration",
      "default": "1"
    },
    "AUTH0_CLIENT_SECRET": {
      "required": true,
      "client": false,
      "type": "string",
      "description": "Auth0 client secret (server-side only)"
    },
    "PORT": {
      "required": false,
      "client": false,
      "type": "int",
      "description": "Port to run the server on",
      "default": 3000
    }
  }
}
```

### 2. Load and validate configuration

```typescript
import { createConfig } from '@eventuras/app-config';
import { resolve } from 'path';

// Load config from app.config.json
const config = createConfig(resolve('./app.config.json'));

// Access environment variables (type-safe!)
const apiUrl = config.get<string>('NEXT_PUBLIC_API_BASE_URL');
const orgId = config.get<string>('NEXT_PUBLIC_ORGANIZATION_ID');
const port = config.get<number>('PORT');

// Check if a variable exists
if (config.has('OPTIONAL_VAR')) {
  const value = config.get('OPTIONAL_VAR');
}

// Get all env vars
const allEnv = config.getAllEnv();

// Get the raw config
const appConfig = config.getConfig();
console.log(appConfig.name); // "@eventuras/web"
console.log(appConfig.runtime?.port); // 3000
```

### 3. Validation happens automatically

When you create a config, all environment variables are validated:

```typescript
// This will throw if any required env vars are missing or invalid
const config = createConfig('./app.config.json');
```

You can also validate explicitly during app initialization:

```typescript
import { validate } from '@eventuras/app-config';

// In your app initialization (e.g., layout.tsx or main.ts)
validate('./app.config.json');
console.log('✓ Environment validated successfully');
```

Error messages are helpful:

```
Environment validation failed:

❌ Required environment variable "NEXT_PUBLIC_API_BASE_URL" is not set.
Description: Base URL for the Eventuras API

❌ Environment variable "PORT" must be a valid integer.
Got: "not-a-number"
```

## Environment Variable Types

| Type | Description | Example |
|------|-------------|---------|
| `string` | Any string value | `"hello"` |
| `url` | Valid URL | `"https://api.example.com"` |
| `int` | Integer number | `3000` |
| `bool` | Boolean (true/false, 1/0) | `true`, `"1"` |
| `json` | Valid JSON | `{"key": "value"}` |

## Configuration Schema

### `app.config.json` Structure

```typescript
interface AppConfig {
  $schema?: string;          // JSON Schema reference
  name: string;              // Package name (e.g., "@eventuras/web")
  type: 'app';               // Always "app"
  description?: string;      // Human-readable description
  env: {                     // Environment variable definitions
    [varName: string]: {
      required: boolean;     // Is this var required?
      client: boolean;       // Exposed to client? (NEXT_PUBLIC_*)
      type: EnvVarType;      // 'string' | 'url' | 'int' | 'bool' | 'json'
      description: string;   // What is this var for?
      default?: any;         // Default value
      pattern?: string;      // Regex pattern
      enum?: string[];       // Allowed values
    }
  };
  build?: {                  // Build configuration (optional)
    outDir?: string;
    target?: string;
  };
  runtime?: {                // Runtime configuration (optional)
    port?: number;
  };
}
```

### Environment Variable Definition

```typescript
interface EnvVarDefinition {
  required: boolean;         // Throw error if missing?
  client: boolean;           // Client-side accessible?
  type: EnvVarType;         // Expected type
  description: string;       // Documentation
  default?: any;            // Fallback value
  pattern?: string;         // Validation regex
  enum?: string[];          // Allowed values
}
```

## Migration from `Environment.ts`

### Before (apps/web/src/utils/Environment.ts)

```typescript
export enum EnvironmentVariables {
  NEXT_PUBLIC_API_BASE_URL = 'NEXT_PUBLIC_API_BASE_URL',
  AUTH0_CLIENT_SECRET = 'AUTH0_CLIENT_SECRET',
}

class Environment {
  static validate() { /* ... */ }
  
  static get NEXT_PUBLIC_API_BASE_URL() {
    return process.env.NEXT_PUBLIC_API_BASE_URL!;
  }
  
  static get(identifier: string): string {
    return process.env[identifier]!;
  }
}
```

### After (apps/web/app.config.json + config.ts)

**app.config.json:**
```json
{
  "name": "@eventuras/web",
  "type": "app",
  "env": {
    "NEXT_PUBLIC_API_BASE_URL": {
      "required": true,
      "client": true,
      "type": "url",
      "description": "API base URL"
    },
    "AUTH0_CLIENT_SECRET": {
      "required": true,
      "client": false,
      "type": "string",
      "description": "Auth0 secret"
    }
  }
}
```

**src/config.ts:**
```typescript
import { createConfig } from '@eventuras/app-config';

export const config = createConfig('./app.config.json');

// Usage:
const apiUrl = config.get<string>('NEXT_PUBLIC_API_BASE_URL');
const secret = config.get<string>('AUTH0_CLIENT_SECRET');
```

## Next.js Integration

For Next.js apps, you can validate the config in your root layout:

```typescript
// app/layout.tsx
import { validate } from '@eventuras/app-config';

// Validate on server startup
validate('./app.config.json');

export default function RootLayout({ children }) {
  return <html><body>{children}</body></html>;
}
```

Or use the config instance directly:

```typescript
// app/layout.tsx
import { createConfig } from '@eventuras/app-config';

// Validate on startup
const config = createConfig('./app.config.json');

export default function RootLayout({ children }) {
  return <html><body>{children}</body></html>;
}
```

Access client-side variables (NEXT_PUBLIC_*):
```typescript
// Client component
'use client';

import { config } from '@/config';

export function MyComponent() {
  // Only NEXT_PUBLIC_* vars are accessible client-side
  const apiUrl = config.get<string>('NEXT_PUBLIC_API_BASE_URL');
  
  return <div>API: {apiUrl}</div>;
}
```

## Benefits Over Manual Validation

1. **Single source of truth**: All env vars documented in one place
2. **Better error messages**: Descriptive errors with context
3. **Type safety**: Automatic type conversion
4. **Self-documenting**: Descriptions built-in
5. **Reusable**: Same library works for all apps
6. **Validated**: Runtime checks with helpful errors
7. **Defaults**: Built-in support for default values
8. **Consistent**: Uses @eventuras/vite-config for building

## Development

MIT
