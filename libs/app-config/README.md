# @eventuras/app-config

Declarative environment configuration for Eventuras applications.

## Overview

`@eventuras/app-config` provides a centralized, type-safe way to manage environment variables across all Eventuras applications. Instead of manually validating env vars in code, you declare them in an `app.config.json` file.


## Development

```bash
# Build the library
pnpm build

# Type check
pnpm typecheck

# Lint
pnpm lint
```

## TypeScript Type Generation

The library includes a tool to generate TypeScript type definitions from your `app.config.json` file. This ensures your client-side environment variables are properly typed.

### Using the generator programmatically

Create a script in your app's `scripts/` directory:

```typescript
#!/usr/bin/env tsx
import path from 'path';
import { fileURLToPath } from 'url';
import { generateTypes } from '@eventuras/app-config/generator';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

generateTypes({
  configPath: path.join(__dirname, '..', 'app.config.json'),
  outputPath: path.join(__dirname, '..', 'src', 'config.client.generated.d.ts'),
  interfaceName: 'WebPublicEnv', // Optional, defaults to 'PublicEnv'
}).catch((error: unknown) => {
  console.error('❌ Failed to generate types:', error);
  process.exit(1);
});
```

Add a script to your `package.json`:

```json
{
  "scripts": {
    "generate:config-types": "tsx scripts/generate-config-types.ts"
  }
}
```

### Generated output

For example, given this config:

```json
{
  "env": {
    "NEXT_PUBLIC_API_BASE_URL": {
      "required": true,
      "client": true,
      "type": "url",
      "description": "API base URL"
    },
    "NEXT_PUBLIC_ORGANIZATION_ID": {
      "required": false,
      "client": true,
      "type": "int",
      "description": "Organization ID"
    }
  }
}
```

The generated `config.client.generated.d.ts` will be:

```typescript
/**
 * AUTO-GENERATED FILE - DO NOT EDIT
 * Generated from app.config.json
 *
 * To regenerate, run: pnpm generate:config-types
 */

export interface WebPublicEnv {
  NEXT_PUBLIC_API_BASE_URL: string;
  NEXT_PUBLIC_ORGANIZATION_ID?: number;
}
```

You can then use this interface to type your client-side environment:

```typescript
import type { WebPublicEnv } from './config.client.generated';

declare global {
  namespace NodeJS {
    interface ProcessEnv extends WebPublicEnv {}
  }
}
```


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

#### Server-Side Usage (Recommended)

```typescript
import { createConfig } from '@eventuras/app-config';

const config = createConfig('./app.config.json');

// Method 1: Direct property access (cleanest for server-side)
const clientId = config.env.AUTH0_CLIENT_ID;
const clientSecret = config.env.AUTH0_CLIENT_SECRET;
const sessionSecret = config.env.SESSION_SECRET;

// Method 2: Using get() with type parameter
const apiUrl = config.get<string>('NEXT_PUBLIC_API_BASE_URL');
const orgId = config.get<string>('NEXT_PUBLIC_ORGANIZATION_ID');
```

#### Next.js Usage (Client + Server)

For Next.js apps, use the `createEnvironment()` helper for automatic compatibility:

```typescript
// config.ts
import { createConfig, createEnvironment } from '@eventuras/app-config';
import { resolve } from 'path';

// Server-side configuration
export const appConfig = createConfig(
  resolve(process.cwd(), 'app.config.json')
);

// Client-side public environment variables
export const publicEnv = createEnvironment(
  resolve(process.cwd(), 'app.config.json')
);
```

```typescript
// In client components - use publicEnv
'use client';

export default function MyComponent() {
  const apiUrl = publicEnv.NEXT_PUBLIC_API_BASE_URL; // ✅ Works in client
  const domain = publicEnv.NEXT_PUBLIC_AUTH0_DOMAIN;  // ✅ Works in client
  
  return <div>API: {apiUrl}</div>;
}
```

```typescript
// In server components / API routes - use appConfig.env
export async function getServerSideProps() {
  // Recommended: Use appConfig.env for server-side variables
  const clientSecret = appConfig.env.AUTH0_CLIENT_SECRET;
  const sessionSecret = appConfig.env.SESSION_SECRET;
  
  // Alternative: Use publicEnv.get() (also works server-side)
  const altSecret = publicEnv.get('AUTH0_CLIENT_SECRET');
  
  return { props: {} };
}
```

**Why explicit getters for NEXT_PUBLIC_*?**  
Next.js performs build-time replacement of `process.env.NEXT_PUBLIC_*`. The `createEnvironment()` helper automatically generates getters that access `process.env` directly, ensuring client-side compatibility while still validating all variables server-side.

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
  // ⚠️ IMPORTANT: For Next.js, NEXT_PUBLIC_* vars MUST access process.env directly
  // Next.js replaces process.env.NEXT_PUBLIC_* at build time
  const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  
  // Or use the Environment wrapper which does this for you:
  import { Environment } from '@/config';
  const apiUrl = Environment.NEXT_PUBLIC_API_BASE_URL;
  
  return <div>API: {apiUrl}</div>;
}
```

**Why the limitation?** Next.js performs build-time replacement of `process.env.NEXT_PUBLIC_*` variables. The `appConfig.get()` method reads from a runtime object, so it won't work for client-side code. Server-side code can use either approach.
