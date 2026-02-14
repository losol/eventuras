# Idem Admin - Kubernetes Deployment

This directory contains Kubernetes deployment configuration for Idem Admin, the Eventuras Identity Administration Dashboard.

## Structure

```
k8s/
├── README.md           # This file - deployment guide
└── chart/              # Helm chart for Idem Admin
    ├── Chart.yaml      # Chart metadata
    ├── values.yaml     # Default values
    └── templates/      # Kubernetes manifests
```

## Prerequisites

- Kubernetes cluster (v1.28+)
- Helm 3.0+
- Traefik with Gateway API support
- cert-manager for TLS certificates
- Docker image: `losolio/idem-admin`

## Quick Start

### 1. Build and Push Docker Image

```bash
# Build image
docker build -t losolio/idem-admin:latest -f apps/idem-admin/Dockerfile .

# Push to registry
docker push losolio/idem-admin:latest
```

### 2. Create Kubernetes Secrets

```bash
# Create namespace
kubectl create namespace idem-admin-dev

# Create secrets (if needed)
kubectl create secret generic idem-admin-secrets -n idem-admin-dev \
  --from-literal=API_URL="https://dev.api.eventuras.dev" \
  --from-literal=NEXT_PUBLIC_API_URL="https://dev.api.eventuras.dev"
```

### 3. Deploy with Helm

```bash
# Deploy to development
helm install idem-admin ./chart \
  --namespace idem-admin-dev \
  --set image.registry=docker.io \
  --set image.repository=losolio/idem-admin \
  --set image.tag=latest \
  --set dns.domain=idem.losol.no \
  --set dns.prefix="admin-dev."

# Upgrade existing deployment
helm upgrade idem-admin ./chart -n idem-admin-dev
```

## Deployment Strategy

### Environments

We use the following environments:

- **Development** (`dev`): Auto-deployed from `main` branch
- **Staging** (`staging`): Auto-deployed from `main` branch with production-like config
- **Production** (`prod`): Deployed via release tags

### Argo CD (Recommended)

This application is designed to be deployed via Argo CD for GitOps workflow.

See [../../docs/infrastructure/argocd-setup.md](../../docs/infrastructure/argocd-setup.md) for setup instructions.

**Argo CD Application Configuration:**

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: idem-admin-dev
spec:
  project: default
  source:
    repoURL: https://github.com/losol/eventuras
    targetRevision: HEAD
    path: apps/idem-admin/k8s/chart
    helm:
      parameters:
        - name: image.registry
          value: docker.io
        - name: image.repository
          value: losolio/idem-admin
        - name: image.tag
          value: main-abc1234
        - name: dns.domain
          value: idem.losol.no
        - name: dns.prefix
          value: admin-dev.
        - name: env.NODE_ENV
          value: production
        - name: env.PORT
          value: "3000"
  destination:
    server: https://kubernetes.default.svc
    namespace: idem-admin-dev
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
```

## Configuration

Environment-specific configuration is managed via Helm values:

| Environment | Namespace | Domain | Image Tag Pattern |
|-------------|-----------|--------|-------------------|
| Development | `idem-admin-dev` | `admin-dev.idem.losol.no` | `main-<sha>` |
| Staging | `idem-admin-staging` | `admin-staging.idem.losol.no` | `main-<sha>` |
| Production | `idem-admin-prod` | `admin.idem.losol.no` | `v<version>` |

See [chart/values.yaml](chart/values.yaml) for all available parameters.

## Environment Variables

Common environment variables set via Argo CD:

```yaml
env:
  NODE_ENV: production
  PORT: "3000"
  NEXT_PUBLIC_API_URL: "https://api.eventuras.dev"  # Set per environment
```

Sensitive variables should be stored in Kubernetes secrets.

## Monitoring & Troubleshooting

### Check Deployment Status

```bash
# Get pods
kubectl get pods -n idem-admin-dev

# Check logs
kubectl logs -f deployment/idem-admin -n idem-admin-dev

# Check events
kubectl get events -n idem-admin-dev --sort-by='.lastTimestamp'
```

### Common Issues

**Pod CrashLoopBackOff:**
- Check environment variables in secrets
- Check application logs: `kubectl logs <pod-name> -n <namespace>`

**502 Bad Gateway:**
- Verify service is running: `kubectl get svc -n <namespace>`
- Check health endpoint: `kubectl port-forward svc/idem-admin 3000:80 -n <namespace>` then curl `http://localhost:3000/api/health`

**Certificate Issues:**
- Verify cert-manager is running: `kubectl get pods -n cert-manager`
- Check certificate status: `kubectl get certificates -n <namespace>`

## Health Checks

The application provides a health endpoint at `/api/health` used by Kubernetes probes:

- **Liveness Probe:** Checks if the Next.js application is alive
- **Readiness Probe:** Checks if the application is ready to serve traffic

## Further Documentation

- [Helm Chart Values](chart/values.yaml)
- [Argo CD Setup](../../docs/infrastructure/argocd-setup.md)
- [Idem Admin Documentation](../README.md)
