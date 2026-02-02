# idem-idp Helm Chart

Helm chart for Idem Identity Provider. All environment-specific values are set by Argo CD.

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

Create a Kubernetes Secret named `idem-idp-secrets` in the target namespace:

```bash
kubectl create secret generic idem-idp-secrets \
  -n <namespace> \
  --from-literal=IDEM_DATABASE_URL='postgresql://user:pass@host:5432/db' \
  --from-literal=IDEM_ISSUER='https://idem.app.domain.no' \
  --from-literal=IDEM_ADMIN_URL='https://admin.idem.app.domain.no'
```

| Secret Key | Description | Example |
|------------|-------------|---------|
| `IDEM_DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `IDEM_ISSUER` | OIDC issuer URL (must match public URL) | `https://idem.app.domain.no` |
| `IDEM_ADMIN_URL` | Admin interface URL | `https://admin.idem.app.domain.no` |

## Resulting Hostnames

| Environment | Prefix | Hostname |
|-------------|--------|----------|
| dev | `dev.` | `dev.idem.app.domain.no` |
| staging | `staging.` | `staging.idem.app.domain.no` |
| prod | `` | `idem.app.domain.no` |
