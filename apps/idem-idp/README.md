# Idem Identity Provider

**Status: Experimental** 🧪

A standalone OpenID Connect (OIDC) identity provider for Eventuras.

## Features (Planned)

- Email OTP passwordless authentication
- IdP brokering (Vipps, HelseID, Google, etc.)
- OAuth 2.0 / OIDC provider
- Single-tenant architecture

## Development

```bash
# Generate migrations
pnpm db:generate

# Run migrations
pnpm db:migrate

# Seed development data
pnpm db:seed

# Start development server
pnpm dev
```

## Architecture

See [docs/](./docs/) for architecture decision records and database schema documentation.
