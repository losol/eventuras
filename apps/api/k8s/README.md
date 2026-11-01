# Eventuras API Kubernetes Deployment

Helm chart for deploying the Eventuras Backend API (.NET) to Kubernetes.

ArgoCD Application(Set) and routing are managed externally (e.g. eventuras-infra).

## Configuration

| Parameter                            | Description                                  | Default                 |
| ------------------------------------ | -------------------------------------------- | ----------------------- |
| `replicaCount`                       | Number of replicas                           | `1`                     |
| `image.registry`                     | Image registry                               | `docker.io`             |
| `image.repository`                   | Image repository                             | `losolio/eventuras-api` |
| `image.tag`                          | Image tag (required)                         | `""`                    |
| `image.pullPolicy`                   | Image pull policy                            | `IfNotPresent`          |
| `service.port`                       | Service port                                 | `80`                    |
| `service.targetPort`                 | Container port                               | `8080`                  |
| `resources.requests.memory`          | Memory request                               | `256Mi`                 |
| `resources.requests.cpu`             | CPU request                                  | `100m`                  |
| `resources.limits.memory`            | Memory limit                                 | `1Gi`                   |
| `resources.limits.cpu`               | CPU limit                                    | `1000m`                 |
| `healthCheck.path`                   | Health check path                            | `/health`               |
| `podAnnotations`                     | Pod annotations (e.g. Infisical auto-reload) | `{}`                    |
| `database.maxPoolSize`               | Npgsql pool cap per replica (see below)      | `""` (API default 20)   |
| `env`                                | Non-sensitive environment variables          | `{}`                    |
| `strategy`                           | Deployment strategy (e.g. RollingUpdate)     | `{}`                    |
| `podDisruptionBudget.enabled`        | Enable PodDisruptionBudget                   | `false`                 |
| `podDisruptionBudget.minAvailable`   | Minimum available pods during disruption     | `1`                     |
| `topologySpreadConstraints`          | Spread pods across nodes                     | `[]`                    |

### High availability

By default the chart runs a single replica with no HA settings, suitable for development or single-node clusters. For production, override via ArgoCD:

```yaml
replicaCount: 2
strategy:
  type: RollingUpdate
  rollingUpdate:
    maxUnavailable: 0
    maxSurge: 1
podDisruptionBudget:
  enabled: true
  minAvailable: 1
```

### Database connections

Each replica has its own pool (default 20). Budget at least
`(replicaCount + maxSurge) × maxPoolSize` (`maxSurge` as a rounded-up pod count),
plus headroom for terminating pods and other clients. If both
`database.maxPoolSize` and `Maximum Pool Size` in the connection string are set,
the lower wins.

### Rate limiting

The API caps concurrent unauthenticated requests to its public endpoints, per
replica (default 10, or half the DB pool if smaller; queue 20; excess gets `429`). Authenticated requests are not
limited. Tune with `env`:

```yaml
env:
  RateLimiting__Anonymous__PermitLimit: "10"
  RateLimiting__Anonymous__QueueLimit: "20"
```

If you set `PermitLimit`, keep it well below `database.maxPoolSize` so
authenticated traffic always has connections left.

For per-client limits, use the proxy, e.g. Traefik's
[`RateLimit` middleware](https://doc.traefik.io/traefik/middlewares/http/ratelimit/)
attached to the route. It needs the real client IP: if a TCP load balancer sits
in front, enable PROXY protocol on it and trust it in Traefik
(`proxyProtocol.trustedIPs`); otherwise all clients share one limit.

Sensitive values belong in `eventuras-api-secrets` (Kubernetes Secret / Infisical).

## Local testing

```bash
helm template eventuras-api apps/api/k8s/ --set image.tag=test
```
