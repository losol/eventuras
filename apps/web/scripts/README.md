# Config Type Generation

This directory contains a script to automatically generate TypeScript types from `app.config.json`.

## Why?

TypeScript cannot properly infer literal types from JSON imports, so `NEXT_PUBLIC_ORGANIZATION_ID` would be typed as `unknown` instead of `number`. To avoid manually maintaining a duplicate interface, we auto-generate the types.

## Usage

Whenever you modify `app.config.json`, regenerate the types:

```bash
pnpm generate:config-types
```

This will update `src/config.client.generated.d.ts` with the correct TypeScript types for all public environment variables.

## How it works

1. Reads `app.config.json`
2. Filters for variables where `client: true`
3. Maps the config types to TypeScript types:
   - `"int"` → `number`
   - `"string"` | `"url"` → `string`
   - `"bool"` → `boolean`
   - `"json"` → `unknown`
4. Generates the `WebPublicEnv` interface with proper types and optionality

## Files

- `generate-config-types.ts` - The generator script
- `../src/config.client.generated.d.ts` - The generated types (auto-generated, don't edit)
- `../app.config.json` - The source of truth
