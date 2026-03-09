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

Sensitive values belong in `eventuras-api-secrets` (Kubernetes Secret / Infisical).

## Local testing

```bash
helm template eventuras-api apps/api/k8s/ --set image.tag=test
```
