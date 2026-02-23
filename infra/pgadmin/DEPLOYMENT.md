# pgAdmin Deployment Guide

## Deploy with Argo CD (Recommended)

Argo CD Application is configured to use an existing Secret for credentials (GitOps-friendly).

### Step 1: Create Credentials Secret

Create the Secret **before** deploying the Application:

```bash
# Create namespace
kubectl create namespace pgadmin

# Create credentials Secret
kubectl create secret generic pgadmin-credentials -n pgadmin \
  --from-literal=email=admin@acme.com \
  --from-literal=password=$(openssl rand -base64 24)
```

You can retrieve the password later with:

```bash
kubectl get secret pgadmin-credentials -n pgadmin -o jsonpath='{.data.password}' | base64 -d
```

### Step 2: Deploy Argo CD Application

```bash
# From repo root
kubectl apply -f infra/pgadmin/argocd-application.yaml
```

### Step 3: Verify Deployment

```bash
# Check Application status
argocd app get pgadmin

# View logs
kubectl logs -n pgadmin -l app=pgadmin

# Access via port-forward
kubectl port-forward -n pgadmin svc/pgadmin 5050:80
```

Open: http://localhost:5050

## Deploy with Helm Directly

```bash
# Create Secret first
kubectl create namespace pgadmin
kubectl create secret generic pgadmin-credentials -n pgadmin \
  --from-literal=email=admin@acme.com \
  --from-literal=password=your-secure-password

# Deploy with Helm
helm install pgadmin ./chart -n pgadmin \
  --set pgadmin.existingSecret.enabled=true \
  --set pgadmin.existingSecret.name=pgadmin-credentials
```

## Upgrading

### Via Argo CD

Changes pushed to `main` branch will automatically sync (auto-sync enabled).

To manually sync:

```bash
argocd app sync pgadmin
```

### Via Helm

```bash
helm upgrade pgadmin ./chart -n pgadmin \
  --set pgadmin.existingSecret.enabled=true \
  --set pgadmin.existingSecret.name=pgadmin-credentials
```

## Accessing pgAdmin

### Local Port-Forward

```bash
kubectl port-forward -n pgadmin svc/pgadmin 5050:80
```

Open: http://localhost:5050

### Via Traefik (External Access)

Enable in values:

```yaml
traefik:
  enabled: true
  hostname: "pgadmin.app.example.com"
  tls:
    certResolver: letsencrypt
  ipWhitelist:
    enabled: true
    sourceRange:
      - "YOUR.IP.ADDRESS/32"
```

Then access via: https://pgadmin.app.example.com

## Configuration

### Argo CD Application Configuration

Location: `infra/pgadmin/argocd-application.yaml`

Key settings:

```yaml
spec:
  source:
    helm:
      valuesObject:
        image:
          tag: "9.12"  # pgAdmin version
        
        pgadmin:
          existingSecret:
            enabled: true
            name: "pgadmin-credentials"
            emailKey: "email"
            passwordKey: "password"
        
        persistence:
          enabled: true
          size: 1Gi
        
        resources:
          requests:
            memory: "256Mi"
            cpu: "100m"
```

### Updating pgAdmin Version

1. Edit `infra/pgadmin/chart/Chart.yaml`:
   ```yaml
   appVersion: "9.13"  # New version
   ```

2. Edit `infra/pgadmin/chart/values.yaml`:
   ```yaml
   image:
     tag: "9.13"
   ```

3. Commit and push to `main` branch
4. Argo CD will automatically sync the new version

## Troubleshooting

### Check Application Status

```bash
argocd app get pgadmin
```

### View Logs

```bash
kubectl logs -n pgadmin -l app=pgadmin --tail=100 -f
```

### Describe Pod

```bash
kubectl describe pod -n pgadmin -l app=pgadmin
```

### Secret Not Found

If you see "secret not found" errors, create the Secret:

```bash
kubectl create secret generic pgadmin-credentials -n pgadmin \
  --from-literal=email=admin@example.com \
  --from-literal=password=your-password
```

### Restart pgAdmin

```bash
kubectl rollout restart deployment pgadmin -n pgadmin
```

## Security Best Practices

- ✅ **Use existingSecret** - Keep credentials out of Git
- ✅ **Enable persistence** - Don't lose configured servers
- ✅ **Set resource limits** - Prevent resource exhaustion
- ✅ **Enable IP whitelist** - Restrict access to known IPs (if using Traefik)
- ✅ **Enable OIDC** - Use SSO instead of passwords (optional)
- ✅ **Regular backups** - Back up pgAdmin PVC data
