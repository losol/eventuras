# Eventuras API OpenAPI Specification

This directory contains the OpenAPI (formerly Swagger) specification for the Eventuras API.

## Files

- **`eventuras-v3.json`**: OpenAPI 3.0 specification for Eventuras API v3

## Updating the Specification

The OpenAPI specification is generated from the running API. To update it:

### From local development

```bash
# Start the API first
cd apps/api
dotnet run --project src/Eventuras.WebApi

# In another terminal, update the spec
cd apps/api
pnpm openapi:update
```

### From production

```bash
cd apps/api
pnpm openapi:update:prod
```

### After updating

1. **Review changes**: `git diff apps/api/docs/eventuras-v3.json`
2. **Regenerate SDK**: `cd libs/event-sdk && pnpm build`
3. **Commit both files**: OpenAPI spec and generated SDK

## Usage

The OpenAPI specification is used by:

- **`libs/event-sdk`**: Auto-generates TypeScript SDK using `@hey-api/openapi-ts`
- **API Documentation**: Can be viewed with Swagger UI at `/swagger` endpoint (dev only)
- **External integrations**: Third-party tools can consume this spec

## Exporting for Documentation

This specification can be copied to the main docs folder for publishing:

```bash
cp apps/api/docs/eventuras-v3.json docs/api/
```

## Version History

The filename includes the API version (v3). When a new major version is released, add a new file:

- `eventuras-v3.json` (current)
- `eventuras-v4.json` (future)

This allows maintaining multiple API versions simultaneously.
