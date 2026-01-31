# Idem Admin

**Status: Experimental**

Admin console for managing idem-idp OAuth clients and settings.

## Development

```bash
pnpm dev  # Starts on port 3210
```

## Cloudflare Tunnel (Dev)

```bash
# Config: ~/.cloudflared/config.yml
# Tunnel: dev | Hostname: idem-admin.dev.domain.io → localhost:3210
cloudflared tunnel route dns dev idem-admin.dev.domain.io
cloudflared tunnel run dev
```
