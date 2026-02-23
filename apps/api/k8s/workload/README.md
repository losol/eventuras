# Eventuras API Helm Chart

This Helm chart deploys the Eventuras Backend API to Kubernetes.

## Prerequisites

- Kubernetes 1.28+
- Helm 3.0+
- Traefik with Gateway API support
- cert-manager for TLS certificates

## Installation

This chart is designed to be deployed via Argo CD with environment-specific values.

### Secrets

Create a secret named `eventuras-api-secrets` with the following keys:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: eventuras-api-secrets
type: Opaque
stringData:
  ConnectionStrings__DefaultConnection: "Host=db;Database=eventuras;Username=user;Password=pass"
  Auth__ClientSecret: "your-auth-client-secret"
  Auth__Issuer: "https://your-idp.example.com"
  Auth__Audience: "https://eventuras/api"
  Sentry__Dsn: "https://xxx@sentry.io/xxx"
  Twilio__Sid: "your-twilio-sid"
  Twilio__AuthToken: "your-twilio-auth-token"
```

## Configuration

| Parameter | Description | Default |
|-----------|-------------|---------|
| `replicaCount` | Number of replicas | `1` |
| `image.registry` | Image registry | `""` |
| `image.repository` | Image repository | `""` |
| `image.tag` | Image tag | `""` |
| `image.pullPolicy` | Image pull policy | `IfNotPresent` |
| `dns.domain` | Base domain | `""` |
| `dns.appName` | Application name for DNS | `""` |
| `dns.prefix` | DNS prefix (e.g., "dev.") | `""` |
| `service.port` | Service port | `80` |
| `service.targetPort` | Container port | `8080` |
| `resources.requests.memory` | Memory request | `256Mi` |
| `resources.requests.cpu` | CPU request | `100m` |
| `resources.limits.memory` | Memory limit | `1Gi` |
| `resources.limits.cpu` | CPU limit | `1000m` |
| `healthCheck.path` | Health check path | `/health` |
| `env` | Environment variables | `{}` |

## Health Checks

The API exposes a `/health` endpoint for Kubernetes probes.
