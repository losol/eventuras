# Eventuras Web - Kubernetes Deployment

This directory contains Kubernetes deployment configuration for Eventuras Web, the main application for participants and organizers.

## Structure

```
k8s/
├── README.md           # This file - deployment guide
└── chart/              # Helm chart for the web app
    ├── Chart.yaml      # Chart metadata
    ├── values.yaml     # Default values
    └── templates/      # Kubernetes manifests
```

## Prerequisites

- Kubernetes cluster (v1.28+)
- Helm 3.0+
- Traefik with Gateway API support
- cert-manager for TLS certificates
- Docker image: `losolio/eventuras-web`
- Running Eventuras API instance

## Quick Start

### 1. Build and Push Docker Image

```bash
# Build image (from monorepo root)
docker build -t losolio/eventuras-web:latest -f apps/web/Dockerfile .

# Push to registry
docker push losolio/eventuras-web:latest
```

### 2. Create Kubernetes Secrets

```bash
# Create namespace
kubectl create namespace eventuras-web-dev

# Create secrets
kubectl create secret generic eventuras-web-secrets -n eventuras-web-dev \
  --from-literal=NEXT_PUBLIC_API_URL="https://dev.api.eventuras.dev" \
  --from-literal=NEXT_PUBLIC_APP_URL="https://dev.app.eventuras.dev" \
  --from-literal=API_URL="https://dev.api.eventuras.dev"
```

### 3. Deploy with Helm

```bash
# Deploy to development
helm install eventuras-web ./chart \
  --namespace eventuras-web-dev \
  --set image.registry=docker.io \
  --set image.repository=losolio/eventuras-web \
  --set image.tag=latest \
  --set dns.domain=eventuras.dev \
  --set dns.appName=app \
  --set dns.prefix="dev."

# Upgrade existing deployment
helm upgrade eventuras-web ./chart -n eventuras-web-dev
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
  name: eventuras-web-dev
spec:
  project: default
  source:
    repoURL: https://github.com/losol/eventuras
    targetRevision: HEAD
    path: apps/web/k8s/chart
    helm:
      parameters:
        - name: image.registry
          value: docker.io
        - name: image.repository
          value: losolio/eventuras-web
        - name: image.tag
          value: main-abc1234
        - name: dns.domain
          value: eventuras.dev
        - name: dns.appName
          value: app
        - name: dns.prefix
          value: dev.
        - name: env.NODE_ENV
          value: production
        - name: env.PORT
          value: "3000"
        - name: env.NEXT_PUBLIC_API_URL
          value: https://dev.api.eventuras.dev
        - name: env.NEXT_PUBLIC_APP_URL
          value: https://dev.app.eventuras.dev
  destination:
    server: https://kubernetes.default.svc
    namespace: eventuras-web-dev
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
```

## Configuration

Environment-specific configuration is managed via Helm values:

| Environment | Namespace | Domain | API URL | Image Tag Pattern |
|-------------|-----------|--------|---------|-------------------|
| Development | `eventuras-web-dev` | `dev.app.eventuras.dev` | `https://dev.api.eventuras.dev` | `main-<sha>` |
| Staging | `eventuras-web-staging` | `staging.app.eventuras.dev` | `https://staging.api.eventuras.dev` | `main-<sha>` |
| Production | `eventuras-web-prod` | `app.eventuras.no` | `https://api.eventuras.no` | `v<version>` |

See [chart/values.yaml](chart/values.yaml) for all available parameters.

## Environment Variables

Common environment variables set via Argo CD:

```yaml
env:
  NODE_ENV: production
  PORT: "3000"
  NEXT_PUBLIC_API_URL: "https://api.eventuras.dev"  # Public-facing API URL
  NEXT_PUBLIC_APP_URL: "https://app.eventuras.dev"  # Application URL
  API_URL: "https://api.eventuras.dev"              # Server-side API URL
```

Sensitive variables should be stored in Kubernetes secrets.

## Resource Allocation

The web application requires more resources than admin dashboards:

- **Requests**: 512Mi memory, 200m CPU, 1Gi ephemeral-storage
- **Limits**: 1Gi memory, 1000m CPU, 2Gi ephemeral-storage

Adjust these in `values.yaml` based on traffic patterns.

## Monitoring & Troubleshooting

### Check Deployment Status

```bash
# Get pods
kubectl get pods -n eventuras-web-dev

# Check logs
kubectl logs -f deployment/eventuras-web -n eventuras-web-dev

# Check events
kubectl get events -n eventuras-web-dev --sort-by='.lastTimestamp'
```

### Common Issues

**Pod CrashLoopBackOff:**
- Check environment variables (especially API URLs)
- Verify API is accessible from cluster
- Check application logs: `kubectl logs <pod-name> -n <namespace>`

**502 Bad Gateway:**
- Verify service is running: `kubectl get svc -n <namespace>`
- Test direct pod access: `kubectl port-forward svc/eventuras-web 3000:80 -n <namespace>` then curl `http://localhost:3000/`
- Note: A health endpoint at `/api/health` should be implemented for better monitoring

**Certificate Issues:**
- Verify cert-manager is running: `kubectl get pods -n cert-manager`
- Check certificate status: `kubectl get certificates -n <namespace>`

**Build/Runtime Errors:**
- Check if all workspace dependencies are built: `pnpm build`
- Verify Dockerfile includes all necessary files
- Check Next.js build output in container logs

## Health Checks

**TODO**: Implement a health endpoint at `/api/health` for Kubernetes probes.

Until implemented, health probes are disabled in the deployment. For production deployments, consider:
- **Liveness Probe:** Check if the Next.js application is alive
- **Readiness Probe:** Check if the application is ready to serve traffic

## Performance Considerations

- **Static Assets**: Next.js optimizes and caches static assets automatically
- **API Calls**: Configure appropriate timeouts for API communication
- **Image Optimization**: Next.js Image component requires appropriate cache settings
- **Build Cache**: Consider mounting build cache for faster deployments

## Further Documentation

- [Helm Chart Values](chart/values.yaml)
- [Argo CD Setup](../../docs/infrastructure/argocd-setup.md)
- [Web Application Documentation](../README.md)
