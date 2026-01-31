# Idem Identity Provider

**Status: Experimental** 🧪

A standalone OpenID Connect (OIDC) identity provider for Eventuras.

## Features

- ✅ OAuth 2.0 / OIDC provider (PAR + PKCE)
- ✅ Email OTP passwordless authentication
- ✅ Admin API for managing OAuth clients
- 🚧 IdP brokering (Vipps, HelseID, Google, etc.)
- 🚧 Account management UI

**Frontend**: Separate app at `apps/idem-idp-frontend` - see its README for details.

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

## Cloudflare Tunnel (Dev)

```bash
# Config: ~/.cloudflared/config.yml
# Tunnel: dev | Hostname: idem-idp-dev.domain.io → localhost:3100
cloudflared tunnel route dns dev idem-idp-dev.domain.io
cloudflared tunnel run dev
```

## Architecture

See [docs/](./docs/) for architecture decision records and database schema documentation.
