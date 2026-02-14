# Argo CD Configuration

Guide for setting up GitHub App integration and applications in Argo CD.

## GitHub App Setup

### 1. Create GitHub App

Go to https://github.com/settings/apps/new (or org settings for org repos)

**Basic Info:**
- **App name:** `ArgoCD-<your-name>` (e.g., `ArgoCD-losol`)
- **Homepage URL:** `https://argo.app.domain.no`
- **Webhook:** Uncheck "Active" (not needed for polling)

**Permissions:**
- Repository permissions → Contents: **Read-only**
- Repository permissions → Metadata: **Read-only**

**Installation:**
- Where can this app be installed: **Only on this account**

Click **Create GitHub App**

### 2. Generate Private Key

After creation:
1. Note the **App ID** (shown at top of page)
2. Scroll down to "Private keys"
3. Click **Generate a private key**
4. Save the downloaded `.pem` file securely

### 3. Install the App

1. Go to https://github.com/settings/apps
2. Click on your app
3. Click **Install App** in sidebar
4. Select your account/org
5. Choose **Only select repositories** → select `eventuras`
6. Click **Install**
7. Note the **Installation ID** from the URL: `https://github.com/settings/installations/<ID>`

### 4. Connect in Argo CD

1. Log in to Argo CD: https://argo.app.domain.no
2. Go to **Settings** → **Repositories** → **Connect Repo**
3. Choose **VIA GITHUB APP**
4. Fill in:
   - **Repository URL:** `https://github.com/losol/eventuras`
   - **GitHub App ID:** (from step 2)
   - **GitHub App Installation ID:** (from step 3)
   - **GitHub App Private Key:** (paste contents of `.pem` file)
5. Click **Connect**

## Creating Applications

**In Argo CD UI:**

1. **Applications** → **New App**
2. Fill in:
   - **Application Name:** `<app>-<env>` (e.g., `myapp-dev`)
   - **Project:** `default`
   - **Sync Policy:** Automatic (dev/staging) or Manual (prod)
     - ✓ Prune Resources
     - ✓ Self Heal
   - **Auto-Create Namespace:** ✓

3. **Source:**
   - **Repository URL:** `https://github.com/losol/eventuras`
   - **Revision:** `HEAD`
   - **Path:** `apps/<app>/k8s/chart`

4. **Destination:**
   - **Cluster URL:** `https://kubernetes.default.svc`
   - **Namespace:** `<app>-<env>`

5. **Helm** section - add environment-specific parameters (see each app's chart README)

6. Click **Create**

### Application-specific Setup

See each application's Kubernetes deployment documentation for detailed setup instructions:

- [eventuras-api](../../apps/api/k8s/README.md)
- [eventuras-web](../../apps/web/k8s/README.md)
- [idem-idp](../../apps/idem-idp/k8s/README.md)
- [idem-admin](../../apps/idem-admin/k8s/README.md)

## Secrets Setup

Before syncing applications, create required secrets in each namespace. See each application's k8s/README.md for specific secret requirements:

- [eventuras-api secrets](../../apps/api/k8s/README.md#2-create-kubernetes-secrets)
- [eventuras-web secrets](../../apps/web/k8s/README.md#2-create-kubernetes-secrets)
- [idem-idp secrets](../../apps/idem-idp/k8s/README.md#2-create-kubernetes-secrets)
- [idem-admin secrets](../../apps/idem-admin/k8s/README.md#2-create-kubernetes-secrets)

### Generic Pattern

```bash
# Create namespace
kubectl create namespace <app>-<env>

# Create secret with required values
kubectl create secret generic <app>-secrets -n <app>-<env> \
  --from-literal=KEY1='value1' \
  --from-literal=KEY2='value2'
```

### Updating Secrets

To update a single secret value:

```bash
# Patch a single key
kubectl patch secret <secret-name> -n <namespace> --type='json' \
  -p='[{"op": "replace", "path": "/data/<KEY>", "value": "'$(echo -n 'new-value' | base64)'"}]'
```

## TLS Configuration

TLS is handled by a **wildcard certificate** (`*.app.domain.no`) in the `traefik` namespace.

- No per-app certificates needed
- No ReferenceGrants needed  
- All HTTPRoutes use the `https` listener automatically

See [Kubernetes Setup](./kubernetes-setup.md) for the infrastructure configuration.

## Image Tagging Strategy

| Tag | Description | Used in |
|-----|-------------|---------|
| `edge` | Every CI build from PR/branch | dev |
| `canary` | CI build from main branch | staging |
| `v1.2.3` | Semantic version release | prod |
| `sha-abc123` | Specific commit | debugging |

## Deployment Flow

1. **PR/branch push** → CI builds and pushes `edge` tag → dev auto-syncs
2. **PR merged to main** → CI builds and pushes `canary` tag → staging auto-syncs
3. **Release created** → CI builds and pushes `v1.2.3` tag → prod manual sync

## Multi-Tenant Setup

For managing multiple environments and customer tenants, use the following pattern:

### Namespace Strategy

**Internal Eventuras environments:**
- `eventuras-api-dev` → dev.api.eventuras.dev (auto-sync)
- `eventuras-api-staging` → staging.api.eventuras.dev (auto-sync)
- `eventuras-api-prod` → api.eventuras.no (manual sync)

**Customer tenants:**
- `<customer>` → api.customer.com (manual sync, separate project)
  - Example: `acme` namespace for ACME Corp customer

### AppProject Pattern

Create separate projects for isolation:

**eventuras-internal project:**
```yaml
apiVersion: argoproj.io/v1alpha1
kind: AppProject
metadata:
  name: eventuras-internal
  namespace: argocd
spec:
  description: Eventuras internal applications (dev, staging, prod)
  sourceRepos:
    - https://github.com/losol/eventuras
  destinations:
    - namespace: 'eventuras-*'
      server: https://kubernetes.default.svc
  clusterResourceWhitelist:
    - group: ''
      kind: Namespace
  namespaceResourceWhitelist:
    - group: '*'
      kind: '*'
```

**Customer project (example):**
```yaml
apiVersion: argoproj.io/v1alpha1
kind: AppProject
metadata:
  name: acme
  namespace: argocd
  labels:
    eventuras.io/customer: acme
spec:
  description: ACME Corp customer applications
  sourceRepos:
    - https://github.com/losol/eventuras
  destinations:
    - namespace: acme
      server: https://kubernetes.default.svc
  clusterResourceWhitelist:
    - group: ''
      kind: Namespace
  namespaceResourceWhitelist:
    - group: '*'
      kind: '*'
```

### Application Examples

**Development environment:**
```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: eventuras-api-dev
  namespace: argocd
  labels:
    app.kubernetes.io/name: eventuras-api
    eventuras.io/environment: dev
    eventuras.io/customer: internal
spec:
  project: eventuras-internal
  source:
    repoURL: https://github.com/losol/eventuras
    targetRevision: main
    path: apps/api/k8s/chart
    helm:
      parameters:
        - name: image.registry
          value: docker.io
        - name: image.repository
          value: losolio/eventuras-api
        - name: image.tag
          value: main-latest
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
    syncOptions:
      - CreateNamespace=true
```

**Customer production:**
```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: acme-api
  namespace: argocd
  labels:
    app.kubernetes.io/name: eventuras-api
    eventuras.io/environment: production
    eventuras.io/customer: acme
    eventuras.io/tenant: acme
  annotations:
    description: "ACME Corp Production API"
spec:
  project: acme
  source:
    repoURL: https://github.com/losol/eventuras
    targetRevision: main
    path: apps/api/k8s/chart
    helm:
      parameters:
        - name: image.registry
          value: docker.io
        - name: image.repository
          value: losolio/eventuras-api
        - name: image.tag
          value: v1.0.0  # Specific stable version
        - name: dns.domain
          value: acme.example.com
        - name: dns.appName
          value: api
        - name: dns.prefix
          value: ""
        # Customer-specific resource overrides
        - name: resources.requests.memory
          value: 512Mi
        - name: resources.limits.memory
          value: 2Gi
  destination:
    server: https://kubernetes.default.svc
    namespace: acme
  syncPolicy:
    # Manual sync for customer production
    syncOptions:
      - CreateNamespace=true
```

### Identifying Customer Tenants in Argo CD

Use labels for clear identification:

```yaml
labels:
  eventuras.io/customer: acme           # Customer identifier
  eventuras.io/tenant: acme             # Tenant (same as customer for single-tenant)
  eventuras.io/environment: production  # Always production for customers
```

**Filter in Argo CD UI:**
- Project: `acme`
- Label: `eventuras.io/customer=acme`
- Label: `eventuras.io/environment=production`

### Customer-Specific Configuration

**Separate Database:**
Each customer should have their own database instance. Configure connection string in namespace secrets:

```bash
kubectl create secret generic eventuras-api-secrets -n acme \
  --from-literal=ConnectionStrings__DefaultConnection="Host=acme-db;Database=acme;..."
```

**Resource Allocation:**
Customer production typically needs more resources than dev/staging:
- Memory: 512Mi - 2Gi (vs 256Mi - 1Gi for dev)
- CPU: 200m - 1000m (vs 100m - 500m for dev)

**Monitoring:**
Configure customer-specific monitoring and alerts in the Application annotations:

```yaml
annotations:
  notifications.argoproj.io/subscribe.on-sync-succeeded.slack: acme-deployments
  notifications.argoproj.io/subscribe.on-sync-failed.slack: acme-alerts
```

## Best Practices

### For Internal Environments (dev/staging)
- ✅ Use auto-sync for rapid iteration
- ✅ Use `main` branch as targetRevision
- ✅ Lower resource limits to save costs
- ✅ Shared infrastructure (databases, caches)

### For Production (internal)
- ⚠️ Manual sync to control deployments
- ⚠️ Use specific version tags (`v1.2.3`)
- ⚠️ Higher resource limits for stability
- ⚠️ Production-grade infrastructure

### For Customer Tenants
- 🔒 Always manual sync - no auto-deploy
- 🔒 Dedicated AppProject per customer
- 🔒 Separate namespace: `<customer>`
- 🔒 Separate database instance
- 🔒 Specific stable version tags only
- 🔒 Customer-specific monitoring/alerts
- 🔒 Higher resource allocations
- 🔒 Use labels: `eventuras.io/customer=<name>`

### Sync Windows (Optional)

For customer production, consider restricting sync times:

```yaml
spec:
  syncWindows:
    - kind: allow
      schedule: '0 9-17 * * 1-5'  # Business hours only
      duration: 8h
      applications:
        - '*'
      manualSync: true
```

## Updating Customer Production

```bash
# Via Argo CD UI:
# 1. Filter by project: acme
# 2. Click "acme-api"
# 3. Update image tag in parameters
# 4. Click "Sync" and review changes
# 5. Confirm

# Via kubectl (update image tag):
kubectl patch application acme-api -n argocd --type merge \
  -p '{"spec":{"source":{"helm":{"parameters":[{"name":"image.tag","value":"v1.2.3"}]}}}}'

# Then sync:
argocd app sync acme-api --prune
```

## Adding New Customers

1. Create AppProject: `kubectl apply -f customer-project.yaml`
2. Create Application: `kubectl apply -f customer-app.yaml`
3. Create namespace secrets: `kubectl create secret generic eventuras-api-secrets -n <customer>`
4. Sync application: `argocd app sync <customer>-api`
5. Verify: `kubectl get pods -n <customer>`
3. **Release created** → CI builds and pushes `v1.2.3` tag → prod manual sync
