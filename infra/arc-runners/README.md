# Self-Hosted GitHub Actions Runners (ARC v2)

Kubernetes-based runners using [ARC v2](https://github.com/actions/actions-runner-controller). Kubernetes mode (no DinD). Docker builds via remote BuildKit (`infra/buildkit/`).

## Components

| Chart | Namespace | Purpose |
|---|---|---|
| `infra/arc-controller` | `arc-systems` | ARC controller — watches GitHub, scales runners |
| `infra/buildkit` | `arc-systems` | BuildKit StatefulSet — rootless, persistent layer cache |
| `infra/arc-runners` | `arc-runners` | Runner scale set (0–2 pods), label `arc-eventuras` |

## Setup

### 1. Create GitHub App

GitHub Settings → Developer settings → GitHub Apps → New:
- **Webhook**: off
- **Permissions**: Actions (Read), Administration (Read & Write), Metadata (Read)
- Install on `losol/eventuras`
- Note **App ID**, **Installation ID**, download **private key** `.pem`

### 2. Deploy

```bash
# Controller
kubectl create namespace arc-systems
cd infra/arc-controller && helm dependency update && helm install arc-controller . -n arc-systems

# BuildKit
cd infra/buildkit && helm install buildkit . -n arc-systems

# Runner secret
kubectl create namespace arc-runners
kubectl create secret generic arc-github-app -n arc-runners \
  --from-literal=github_app_id=<APP_ID> \
  --from-literal=github_app_installation_id=<INSTALLATION_ID> \
  --from-file=github_app_private_key=<PEM_FILE>

# Runners
cd infra/arc-runners && helm dependency update && helm install arc-runners . -n arc-runners
```

### 3. Update workflows

```yaml
runs-on: arc-eventuras
```

Docker builds use remote BuildKit — only change is the Buildx driver:

```yaml
- uses: docker/setup-buildx-action@v3
  with:
    driver: remote
    endpoint: tcp://buildkit.arc-systems.svc:1234
```

## Security & Observability

- **Security context**: Runner pods drop all Linux capabilities, no privilege escalation
- **Network policies**: Runners deny all ingress; BuildKit only accepts connections from `arc-runners` namespace
- **Namespace isolation**: Controller restricted to `arc-systems` via `watchSingleNamespace`
- **GitHub App auth**: No PAT needed — uses GitHub App with minimal permissions
- **Prometheus metrics**: Controller and listener expose metrics on `:8080/metrics`

## Verify

```bash
kubectl get pods -n arc-systems                    # controller + buildkit running
kubectl get autoscalingrunnerset -n arc-runners    # scale set registered
kubectl get pods -n arc-runners -w                 # runners scale on job queue
```
