# Eventuras API - Kubernetes Deployment

This directory contains Kubernetes deployment configuration for the Eventuras Backend API.

## Structure

```
k8s/
├── README.md           # This file - deployment guide
└── chart/              # Helm chart for the API
    ├── Chart.yaml      # Chart metadata
    ├── README.md       # Helm chart documentation
    ├── values.yaml     # Default values
    └── templates/      # Kubernetes manifests
```

## Prerequisites

- Kubernetes cluster (v1.28+)
- Helm 3.0+
- Traefik with Gateway API support
- cert-manager for TLS certificates
- PostgreSQL database
- Docker image: `losolio/eventuras-api`

## Quick Start

### 1. Build and Push Docker Image

```bash
# Build image
docker build -t losolio/eventuras-api:latest -f apps/api/Dockerfile .

# Push to registry
docker push losolio/eventuras-api:latest
```

### 2. Create Kubernetes Secrets

```bash
# Create namespace
kubectl create namespace eventuras-api-dev

# Create secrets (see chart/README.md for all required keys)
kubectl create secret generic eventuras-api-secrets -n eventuras-api-dev \
  --from-literal=ConnectionStrings__DefaultConnection="Host=db;Database=eventuras;..." \
  --from-literal=Auth__ClientSecret="your-secret" \
  --from-literal=Sentry__Dsn="https://xxx@sentry.io/xxx"
```

See [chart/README.md](chart/README.md#secrets) for complete list of required secrets.

### 3. Deploy with Helm

```bash
# Deploy to development
helm install eventuras-api ./chart \
  --namespace eventuras-api-dev \
  --set image.registry=docker.io \
  --set image.repository=losolio/eventuras-api \
  --set image.tag=latest \
  --set dns.domain=eventuras.dev \
  --set dns.appName=api \
  --set dns.prefix="dev."

# Upgrade existing deployment
helm upgrade eventuras-api ./chart -n eventuras-api-dev
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
  name: eventuras-api-dev
spec:
  project: default
  source:
    repoURL: https://github.com/losol/eventuras
    targetRevision: HEAD
    path: apps/api/k8s/chart
    helm:
      parameters:
        - name: image.registry
          value: docker.io
        - name: image.repository
          value: losolio/eventuras-api
        - name: image.tag
          value: main-abc1234
        - name: dns.domain
          value: eventuras.dev
        - name: dns.appName
          value: api
        - name: dns.prefix
          value: dev.
  destination:
    server: https://kubernetes.default.svc
    namespace: eventuras-api-dev
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
```

## Configuration

Environment-specific configuration is managed via Helm values:

| Environment | Namespace | Domain | Image Tag Pattern |
|-------------|-----------|--------|-------------------|
| Development | `eventuras-api-dev` | `dev.api.eventuras.dev` | `main-<sha>` |
| Staging | `eventuras-api-staging` | `staging.api.eventuras.dev` | `main-<sha>` |
| Production | `eventuras-api-prod` | `api.eventuras.no` | `v<version>` |

See [chart/README.md](chart/README.md#configuration) for all available parameters.

## Monitoring & Troubleshooting

### Check Deployment Status

```bash
# Get pods
kubectl get pods -n eventuras-api-dev

# Check logs
kubectl logs -f deployment/eventuras-api -n eventuras-api-dev

# Check events
kubectl get events -n eventuras-api-dev --sort-by='.lastTimestamp'
```

### Common Issues

**Pod CrashLoopBackOff:**
- Check database connection string in secrets
- Verify database is accessible from cluster
- Check application logs: `kubectl logs <pod-name> -n <namespace>`

**502 Bad Gateway:**
- Verify service is running: `kubectl get svc -n <namespace>`
- Check health endpoint: `kubectl port-forward svc/eventuras-api 8080:80 -n <namespace>` then curl `http://localhost:8080/health`

**Certificate Issues:**
- Verify cert-manager is running: `kubectl get pods -n cert-manager`
- Check certificate status: `kubectl get certificates -n <namespace>`

## Health Checks

The API provides a health endpoint at `/health` used by Kubernetes probes:

- **Liveness Probe:** Checks if the application is alive
- **Readiness Probe:** Checks if the application is ready to serve traffic

## Further Documentation

- [Helm Chart Documentation](chart/README.md)
- [Argo CD Setup](../../docs/infrastructure/argocd-setup.md)
- [API Documentation](../README.md)
