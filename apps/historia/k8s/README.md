# Historia Kubernetes Deployment

Helm chart for deploying Historia CMS (Payload CMS / Next.js) to Kubernetes.

ArgoCD Application(Set) and routing are managed externally (e.g. eventuras-infra).

## Configuration

| Parameter | Description | Default |
|-----------|-------------|---------|
| `replicaCount` | Number of replicas | `1` |
| `image.registry` | Image registry | `docker.io` |
| `image.repository` | Image repository | `losolio/historia` |
| `image.tag` | Image tag (required) | `""` |
| `image.pullPolicy` | Image pull policy | `IfNotPresent` |
| `service.port` | Service port | `80` |
| `service.targetPort` | Container port | `3000` |
| `resources.requests.memory` | Memory request | `512Mi` |
| `resources.requests.cpu` | CPU request | `200m` |
| `resources.limits.memory` | Memory limit | `1Gi` |
| `resources.limits.cpu` | CPU limit | `1000m` |
| `healthCheck.path` | Health check path | `/api/health` |
| `podAnnotations` | Pod annotations (e.g. Infisical auto-reload) | `{}` |
| `env` | Non-sensitive environment variables | `{}` |

Sensitive values belong in `historia-secrets` (Kubernetes Secret / Infisical).

## Local testing

```bash
helm template historia apps/historia/k8s/ --set image.tag=test
```
