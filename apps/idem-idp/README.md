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

## Kubernetes Deployment

### Environments

| Environment | Namespace | Hostname | Description |
|-------------|-----------|----------|-------------|
| Development | `idem-idp-dev` | `dev.idem.app.losol.no` | For development and testing |
| Staging | `idem-idp-staging` | `staging.idem.app.losol.no` | Pre-production validation |
| Production | `idem-idp-prod` | `idem.app.losol.no` | Live production environment |

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | Yes | Set to `production` for deployed environments |
| `IDEM_ISSUER` | Yes | Public OIDC issuer URL (e.g., `https://idem-idp.app.domain.no`) |
| `IDEM_ADMIN_URL` | Yes | Admin interface URL |
| `IDEM_DATABASE_URL` | Yes | PostgreSQL connection string |
| `IDEM_SESSION_SECRET` | Yes | Random secret for session encryption (min 32 chars) |
| `IDEM_ADMIN_CLIENT_SECRET` | Yes | Random secret for admin OAuth client |

### Generate Secure Secrets

```bash
# Generate cryptographically secure random secrets
openssl rand -base64 32  # For IDEM_SESSION_SECRET
openssl rand -base64 32  # For IDEM_ADMIN_CLIENT_SECRET
```

### Create Kubernetes Secrets (CLI Method)

The safest way to create secrets without storing them in files:

```bash
# Create secrets directly (values not stored in shell history with leading space)
 kubectl create secret generic idem-idp-secrets \
  -n idem-idp-dev \
  --from-literal=IDEM_DATABASE_URL='postgresql://user:password@host:5432/idem' \
  --from-literal=IDEM_SESSION_SECRET="$(openssl rand -base64 32)" \
  --from-literal=IDEM_ADMIN_CLIENT_SECRET="$(openssl rand -base64 32)"
```

### Create ConfigMap

```bash
kubectl create configmap idem-idp-config \
  -n idem-idp-dev \
  --from-literal=NODE_ENV=production \
  --from-literal=IDEM_ISSUER=https://idem-idp.app.domain.no \
  --from-literal=IDEM_ADMIN_URL=https://idem-admin.app.domain.no
```

### Alternative: YAML Files (for GitOps)

For GitOps workflows, use Sealed Secrets or External Secrets Operator.
Never commit plain secrets to git.

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: idem-idp-config
  namespace: idem-idp-dev
data:
  NODE_ENV: "production"
  IDEM_ISSUER: "https://idem-idp.app.domain.no"
  IDEM_ADMIN_URL: "https://idem-admin.app.domain.no"
```

Apply the configuration:

```bash
kubectl apply -f k8s/config.yaml
```

### Deployment

The deployment references the ConfigMap and Secret:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: idem-idp
  namespace: idem-idp-dev
spec:
  replicas: 1
  selector:
    matchLabels:
      app: idem-idp
  template:
    metadata:
      labels:
        app: idem-idp
    spec:
      containers:
        - name: idem-idp
          image: ghcr.io/losol/idem-idp:latest
          ports:
            - containerPort: 3100
          envFrom:
            - configMapRef:
                name: idem-idp-config
            - secretRef:
                name: idem-idp-secrets
```

### TLS Certificate and HTTPRoute

See [Kubernetes Setup](../../docs/infrastructure/kubernetes-setup.md) for full instructions on adding new applications with TLS certificates.

Quick reference:

1. Create Certificate and ReferenceGrant in namespace
2. Add HTTPS listener to Gateway with hostname
3. Create HTTPRoute pointing to service

## Architecture

See [docs/](./docs/) for architecture decision records and database schema documentation.
