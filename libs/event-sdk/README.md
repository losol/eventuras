# @eventuras/event-sdk

Auto-generated TypeScript SDK for the Eventuras API.

## Installation

This package is part of the Eventuras monorepo and is available as a workspace package:

```bash
pnpm add @eventuras/event-sdk
```

## Usage

```typescript
import { getV3Events } from '@eventuras/event-sdk';
import { createClient } from '@eventuras/event-sdk/client-next';

// Configure the client
const client = createClient({
  baseUrl: 'https://api.example.com',
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

// Use the SDK
const events = await getV3Events({ client });
```

## Development

### Generating the SDK

The SDK is generated from the OpenAPI specification (`swagger.json`):

```bash
pnpm build
```

This will:

1. Generate TypeScript types and client code from `swagger.json` using `@hey-api/openapi-ts`
2. Compile TypeScript to JavaScript with type declarations

### Configuration

- `openapi-ts.config.ts`: Configuration for the OpenAPI TypeScript generator
- `tsconfig.json`: TypeScript compiler options (outputs to `dist/`)

## Known Issues

### swagger.json adaptations

The `swagger.json` file may need manual adaptations to work with `@hey-api/openapi-ts`:

- Remove `readonly: true` properties that cause generation errors
- Exclude problematic schemas (e.g., `EventFormDtoJsonPatchDocument`)

Related issue: <https://github.com/hey-api/openapi-ts/pull/1896>

## Architecture

This SDK uses the modern `@hey-api/client-next` plugin which provides:

- Type-safe API calls
- Runtime configuration support
- Better error handling
- Improved tree-shaking


The generated code is in `src/client/` and is compiled to `dist/` for distribution.
