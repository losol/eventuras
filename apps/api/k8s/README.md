# Eventuras API Kubernetes Deployment

Helm chart for deploying the Eventuras Backend API (.NET) to Kubernetes.

ArgoCD Application(Set) and routing are managed externally (e.g. eventuras-infra).

## Configuration

| Parameter                   | Description                                  | Default                 |
| --------------------------- | -------------------------------------------- | ----------------------- |
| `replicaCount`              | Number of replicas                           | `1`                     |
| `image.registry`            | Image registry                               | `docker.io`             |
| `image.repository`          | Image repository                             | `losolio/eventuras-api` |
| `image.tag`                 | Image tag (required)                         | `""`                    |
| `image.pullPolicy`          | Image pull policy                            | `IfNotPresent`          |
| `service.port`              | Service port                                 | `80`                    |
| `service.targetPort`        | Container port                               | `8080`                  |
| `resources.requests.memory` | Memory request                               | `256Mi`                 |
| `resources.requests.cpu`    | CPU request                                  | `100m`                  |
| `resources.limits.memory`   | Memory limit                                 | `1Gi`                   |
| `resources.limits.cpu`      | CPU limit                                    | `1000m`                 |
| `healthCheck.path`          | Health check path                            | `/health`               |
| `podAnnotations`            | Pod annotations (e.g. Infisical auto-reload) | `{}`                    |
| `env`                       | Non-sensitive environment variables          | `{}`                    |

Sensitive values belong in `eventuras-api-secrets` (Kubernetes Secret / Infisical).

## Local testing

```bash
helm template eventuras-api apps/api/k8s/ --set image.tag=test
```
