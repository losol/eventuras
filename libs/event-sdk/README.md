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

The SDK is generated from the OpenAPI specification exported by `@eventuras/api`:

```bash
pnpm build
```

This will:

1. Generate TypeScript types and client code from the OpenAPI spec using `@hey-api/openapi-ts`
2. Compile TypeScript to JavaScript with type declarations

### Updating the OpenAPI Specification

The OpenAPI specification must be updated whenever the API changes:

```bash
# From the repository root:
pnpm openapi:update

# This will:
# 1. Start the API (or use running instance)
# 2. Fetch apps/api/docs/eventuras-v3.json
# 3. Regenerate libs/event-sdk automatically
```

### Configuration

- `openapi-ts.config.ts`: Configuration for the OpenAPI TypeScript generator
  - Uses `@eventuras/api/openapi` export to access the spec
- `tsconfig.json`: TypeScript compiler options (outputs to `dist/`)
- Source spec: `@eventuras/api/openapi` → `apps/api/docs/eventuras-v3.json`

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
