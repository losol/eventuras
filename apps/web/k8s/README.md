# Eventuras Web Kubernetes Deployment

Helm chart for deploying Eventuras Web (Next.js) to Kubernetes.

ArgoCD Application(Set) and routing are managed externally (e.g. eventuras-infra).

## Configuration

| Parameter | Description | Default |
|-----------|-------------|---------|
| `replicaCount` | Number of replicas | `1` |
| `image.registry` | Image registry | `docker.io` |
| `image.repository` | Image repository | `losolio/eventuras-web` |
| `image.tag` | Image tag (required) | `""` |
| `image.pullPolicy` | Image pull policy | `IfNotPresent` |
| `service.port` | Service port | `80` |
| `service.targetPort` | Container port | `3000` |
| `resources.requests.memory` | Memory request | `512Mi` |
| `resources.requests.cpu` | CPU request | `200m` |
| `resources.limits.memory` | Memory limit | `1Gi` |
| `resources.limits.cpu` | CPU limit | `1000m` |
| `healthCheck.path` | Health check path | `/api/healthz` |
| `podAnnotations` | Pod annotations (e.g. Infisical auto-reload) | `{}` |
| `env` | Non-sensitive environment variables | `{}` |
| `strategy` | Deployment strategy (e.g. RollingUpdate) | `{}` |
| `podDisruptionBudget.enabled` | Enable PodDisruptionBudget | `false` |
| `podDisruptionBudget.minAvailable` | Minimum available pods during disruption | `1` |
| `topologySpreadConstraints` | Spread pods across nodes | `[]` |

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

Sensitive values belong in `eventuras-web-secrets` (Kubernetes Secret / Infisical).

## Local testing

```bash
helm template eventuras-web apps/web/k8s/ --set image.tag=test
```
