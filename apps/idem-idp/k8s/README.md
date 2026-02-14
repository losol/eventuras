# Idem IDP - Kubernetes Deployment

This directory contains Kubernetes deployment configuration for Idem IDP, the Eventuras Identity Provider.

## Structure

```
k8s/
├── README.md           # This file - deployment guide
└── chart/              # Helm chart for Idem IDP
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
- Docker image: `losolio/idem-idp`

## Quick Start

### 1. Build and Push Docker Image

```bash
# Build image
docker build -t losolio/idem-idp:latest -f apps/idem-idp/Dockerfile .

# Push to registry
docker push losolio/idem-idp:latest
```

### 2. Create Kubernetes Secrets

```bash
# Create namespace
kubectl create namespace idem-idp-dev

# Create secrets (see chart/README.md for all required keys and secure generation)
kubectl create secret generic idem-idp-secrets -n idem-idp-dev \
  --from-literal=IDEM_DATABASE_URL="postgresql://user:pass@host:5432/idem" \
  --from-literal=IDEM_SESSION_SECRET="$(openssl rand -base64 32)" \
  --from-literal=IDEM_MASTER_KEY="$(openssl rand -base64 32)" \
  --from-literal=IDEM_ISSUER="https://dev.idem.losol.no" \
  --from-literal=IDEM_ADMIN_URL="https://admin-dev.idem.losol.no"
```

See [chart/README.md](chart/README.md#required-secrets) for complete list of required secrets and secure value generation.

### 3. Deploy with Helm

```bash
# Deploy to development
helm install idem-idp ./chart \
  --namespace idem-idp-dev \
  --set image.registry=docker.io \
  --set image.repository=losolio/idem-idp \
  --set image.tag=latest \
  --set dns.domain=idem.losol.no \
  --set dns.prefix="dev."

# Upgrade existing deployment
helm upgrade idem-idp ./chart -n idem-idp-dev
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
  name: idem-idp-dev
spec:
  project: default
  source:
    repoURL: https://github.com/losol/eventuras
    targetRevision: HEAD
    path: apps/idem-idp/k8s/chart
    helm:
      parameters:
        - name: image.registry
          value: docker.io
        - name: image.repository
          value: losolio/idem-idp
        - name: image.tag
          value: sha-abc1234
        - name: dns.domain
          value: idem.losol.no
        - name: dns.prefix
          value: dev.
        - name: env.NODE_ENV
          value: production
  destination:
    server: https://kubernetes.default.svc
    namespace: idem-idp-dev
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
```

## Configuration

Environment-specific configuration is managed via Helm values:

| Environment | Namespace | Domain | Image Tag Pattern |
|-------------|-----------|--------|-------------------|
| Development | `idem-idp-dev` | `dev.idem.losol.no` | `sha-<sha>` |
| Staging | `idem-idp-staging` | `staging.idem.losol.no` | `sha-<sha>` |
| Production | `idem-idp-prod` | `idem.losol.no` | `v<version>` |

See [chart/README.md](chart/README.md#configuration) for all available parameters.

## Database Setup

Idem IDP requires a PostgreSQL database. Make sure to:

1. Create the database before deployment
2. Run migrations (handled automatically on startup)
3. Configure connection string in secrets

## Monitoring & Troubleshooting

### Check Deployment Status

```bash
# Get pods
kubectl get pods -n idem-idp-dev

# Check logs
kubectl logs -f deployment/idem-idp -n idem-idp-dev

# Check events
kubectl get events -n idem-idp-dev --sort-by='.lastTimestamp'
```

### Common Issues

**Pod CrashLoopBackOff:**
- Check database connection string in secrets
- Verify database is accessible from cluster
- Check application logs: `kubectl logs <pod-name> -n <namespace>`

**502 Bad Gateway:**
- Verify service is running: `kubectl get svc -n <namespace>`
- Check health endpoint: `kubectl port-forward svc/idem-idp 5000:80 -n <namespace>` then curl `http://localhost:5000/health`

**Certificate Issues:**
- Verify cert-manager is running: `kubectl get pods -n cert-manager`
- Check certificate status: `kubectl get certificates -n <namespace>`

**Migration Failures:**
- Check database permissions
- Review migration logs in pod startup
- Manually run migrations if needed

## Health Checks

The IDP provides health endpoints used by Kubernetes probes:

- **Liveness Probe:** Checks if the application is alive
- **Readiness Probe:** Checks if the application is ready to serve traffic

## Security Considerations

- Store all secrets in Kubernetes secrets, never in values files
- Use strong random values for IDEM_SESSION_SECRET and IDEM_MASTER_KEY (use `openssl rand -base64 32`)
- Enable HTTPS for all environments
- Review CORS settings for production
- Rotate secrets regularly

## Further Documentation

- [Helm Chart Documentation](chart/README.md)
- [Argo CD Setup](../../docs/infrastructure/argocd-setup.md)
- [Idem IDP Documentation](../README.md)
