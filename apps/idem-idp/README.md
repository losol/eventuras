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
| Development | `idem-idp-dev` | `dev.idem.example.com` | For development and testing |
| Staging | `idem-idp-staging` | `staging.idem.example.com` | Pre-production validation |
| Production | `idem-idp-prod` | `idem.example.com` | Live production environment |

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | Yes | Set to `production` for deployed environments |
| `IDEM_ISSUER` | Yes | Public OIDC issuer URL (e.g., `https://idem-idp.app.domain.no`) |
| `IDEM_ADMIN_URL` | Yes | Admin interface URL |
| `IDEM_DATABASE_URL` | Yes | PostgreSQL connection string |
| `IDEM_SESSION_SECRET` | Yes | Random secret for session encryption (min 32 chars) |
| `IDEM_BOOTSTRAP_ENABLED` | No | Enable bootstrap endpoint for initial setup |
| `IDEM_BOOTSTRAP_TOKEN` | If bootstrap enabled | Secret token for bootstrap (min 32 chars) |

## Initial Setup (Bootstrap)

When deploying Idem for the first time, you need to create the first systemadmin:

### 1. Generate a bootstrap token

```bash
export BOOTSTRAP_TOKEN=$(openssl rand -hex 32)
echo "BOOTSTRAP_TOKEN: $BOOTSTRAP_TOKEN"
```

### 2. Deploy with bootstrap enabled

Set environment variables:
- `IDEM_BOOTSTRAP_ENABLED=true`
- `IDEM_BOOTSTRAP_TOKEN=<your-token>`

### 3. Initialize the system

```bash
curl -X POST https://idem.example.com/api/system/init \
  -H "Authorization: Bearer $BOOTSTRAP_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "name": "System Administrator"}'
```

**Response:**

```json
{
  "message": "Bootstrap successful",
  "account_id": "uuid-of-the-account",
  "email": "admin@example.com",
  "role": "systemadmin",
  "client_id": "idem-admin",
  "client_secret": "64-hex-character-secret",
  "note": "IMPORTANT: Save the client_secret now..."
}
```

⚠️ **Save `client_secret`!** It is only shown once.

### 4. Disable bootstrap and redeploy

Set `IDEM_BOOTSTRAP_ENABLED=false` or remove the environment variables, then redeploy.

### 5. Configure idem-admin

Use the returned `client_secret` to configure the admin console:
- `IDEM_IDP_CLIENT_SECRET=<client_secret_from_response>`

See [ADR 0018](./docs/adr/0018-per-client-rbac.md) for detailed documentation.

### Generate Secure Secrets

```bash
# Generate cryptographically secure random secrets
openssl rand -base64 32  # For IDEM_SESSION_SECRET
openssl rand -hex 32     # For IDEM_BOOTSTRAP_TOKEN
```

### Create Kubernetes Secrets (CLI Method)

The safest way to create secrets without storing them in files:

```bash
# Create secrets directly (values not stored in shell history with leading space)
 kubectl create secret generic idem-idp-secrets \
  -n idem-idp-dev \
  --from-literal=IDEM_DATABASE_URL='postgresql://user:password@host:5432/idem' \
  --from-literal=IDEM_SESSION_SECRET="$(openssl rand -base64 32)" \
  --from-literal=IDEM_BOOTSTRAP_TOKEN="$(openssl rand -hex 32)"
```

> **Note:** After running bootstrap, update the secret to remove `IDEM_BOOTSTRAP_TOKEN` and set
> `IDEM_BOOTSTRAP_ENABLED=false` in the ConfigMap.

### Create ConfigMap

```bash
# For initial deployment with bootstrap enabled:
kubectl create configmap idem-idp-config \
  -n idem-idp-dev \
  --from-literal=NODE_ENV=production \
  --from-literal=IDEM_ISSUER=https://idem-idp.app.domain.no \
  --from-literal=IDEM_ADMIN_URL=https://idem-admin.app.domain.no \
  --from-literal=IDEM_BOOTSTRAP_ENABLED=true

# After bootstrap, update to disable:
kubectl patch configmap idem-idp-config -n idem-idp-dev \
  --type merge -p '{"data":{"IDEM_BOOTSTRAP_ENABLED":"false"}}'
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

### TLS and HTTPRoute

HTTPS is handled by a **wildcard certificate** (`*.idem.example.com`) in the `traefik` namespace.

- No per-app certificates needed
- No ReferenceGrants needed
- HTTPRoutes automatically use the wildcard HTTPS listener

See [Kubernetes Setup](../../docs/infrastructure/kubernetes-setup.md) for infrastructure details.

## Architecture

See [docs/](./docs/) for architecture decision records and database schema documentation.
