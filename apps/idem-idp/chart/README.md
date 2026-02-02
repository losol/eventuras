# idem-idp Helm Chart

Helm chart for Idem Identity Provider. All environment-specific values are set by Argo CD.

## Environments

| Environment | Namespace | Hostname | Description |
|-------------|-----------|----------|-------------|
| Development | `idem-idp-dev` | `dev.idem.app.losol.no` | For development and testing |
| Staging | `idem-idp-staging` | `staging.idem.app.losol.no` | Pre-production validation |
| Production | `idem-idp-prod` | `idem.app.losol.no` | Live production environment |

## Required Values

Set these in Argo CD Application:

```yaml
helm:
  values: |
    image:
      registry: docker.io
      repository: losolio/idem-idp
      tag: sha-abc123

    dns:
      domain: app.domain.no
      appName: idem
      prefix: "dev."  # "dev.", "staging.", or "" for prod

    env:
      NODE_ENV: production
      PORT: "3001"
      LOG_LEVEL: info
      DATABASE_URL: postgres://...
```

## Values Reference

| Value | Description | Example |
|-------|-------------|---------|
| `replicaCount` | Number of replicas | `1`, `2`, `3` |
| `image.registry` | Container registry | `docker.io` |
| `image.repository` | Image repository | `losolio/idem-idp` |
| `image.tag` | Image tag | `sha-abc123`, `v1.2.3` |
| `dns.domain` | Base domain | `app.domain.no` |
| `dns.appName` | App subdomain | `idem` |
| `dns.prefix` | Environment prefix | `dev.`, `staging.`, `` |
| `env.NODE_ENV` | Node environment | `development`, `production` |
| `env.PORT` | Application port | `3001` |
| `env.LOG_LEVEL` | Log verbosity | `debug`, `info`, `warn` |

## Required Secrets

Create a Kubernetes Secret named `idem-idp-secrets` in the target namespace.

### Generate Secure Secrets

```bash
# Generate cryptographically secure random values
openssl rand -base64 32  # For IDEM_SESSION_SECRET
openssl rand -base64 32  # For IDEM_ADMIN_CLIENT_SECRET
```

### Create Secret (with auto-generated values)

```bash
# Development environment
 kubectl create secret generic idem-idp-secrets \
  -n idem-idp-dev \
  --from-literal=IDEM_DATABASE_URL='postgresql://user:pass@host:5432/idem_dev' \
  --from-literal=IDEM_ISSUER='https://dev.idem.app.losol.no' \
  --from-literal=IDEM_ADMIN_URL='https://dev.admin.idem.app.losol.no' \
  --from-literal=IDEM_SESSION_SECRET="$(openssl rand -base64 32)" \
  --from-literal=IDEM_ADMIN_CLIENT_SECRET="$(openssl rand -base64 32)"

# Staging environment
 kubectl create secret generic idem-idp-secrets \
  -n idem-idp-staging \
  --from-literal=IDEM_DATABASE_URL='postgresql://user:pass@host:5432/idem_staging' \
  --from-literal=IDEM_ISSUER='https://staging.idem.app.losol.no' \
  --from-literal=IDEM_ADMIN_URL='https://staging.admin.idem.app.losol.no' \
  --from-literal=IDEM_SESSION_SECRET="$(openssl rand -base64 32)" \
  --from-literal=IDEM_ADMIN_CLIENT_SECRET="$(openssl rand -base64 32)"

# Production environment
 kubectl create secret generic idem-idp-secrets \
  -n idem-idp-prod \
  --from-literal=IDEM_DATABASE_URL='postgresql://user:pass@host:5432/idem_prod' \
  --from-literal=IDEM_ISSUER='https://idem.app.losol.no' \
  --from-literal=IDEM_ADMIN_URL='https://admin.idem.app.losol.no' \
  --from-literal=IDEM_SESSION_SECRET="$(openssl rand -base64 32)" \
  --from-literal=IDEM_ADMIN_CLIENT_SECRET="$(openssl rand -base64 32)"
```

| Secret Key | Description | Example |
| `IDEM_DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `IDEM_ISSUER` | OIDC issuer URL (must match public URL) | `https://idem.app.domain.no` |
| `IDEM_ADMIN_URL` | Admin interface URL | `https://admin.idem.app.domain.no` |
| `IDEM_SESSION_SECRET` | Session encryption secret (min 32 chars) | `$(openssl rand -base64 32)` |
| `IDEM_ADMIN_CLIENT_SECRET` | Admin OAuth client secret | `$(openssl rand -base64 32)` |

## Resulting Hostnames

| Environment | Namespace | Prefix | Hostname |
|-------------|-----------|--------|----------|
| Development | `idem-idp-dev` | `dev.` | `dev.idem.app.losol.no` |
| Staging | `idem-idp-staging` | `staging.` | `staging.idem.app.losol.no` |
| Production | `idem-idp-prod` | `` | `idem.app.losol.no` |
