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

### idem-idp-dev

**In Argo CD UI:**

1. **Applications** → **New App**
2. Fill in:
   - **Application Name:** `idem-idp-dev`
   - **Project:** `default`
   - **Sync Policy:** Automatic
     - ✓ Prune Resources
     - ✓ Self Heal
   - **Auto-Create Namespace:** ✓

3. **Source:**
   - **Repository URL:** `https://github.com/losol/eventuras`
   - **Revision:** `HEAD`
   - **Path:** `apps/idem-idp/chart`

4. **Destination:**
   - **Cluster URL:** `https://kubernetes.default.svc`
   - **Namespace:** `idem-idp-dev`

5. **Helm** section - add these parameters:
   ```yaml
   image.registry: docker.io
   image.repository: losolio/idem-idp
   image.tag: canary
   dns.domain: app.domain.no
   dns.appName: idem
   dns.prefix: "dev."
   env.NODE_ENV: production
   env.PORT: "3001"
   env.LOG_LEVEL: debug
   ```

6. Click **Create**

### idem-idp-staging

Same as dev, but with:
- **Application Name:** `idem-idp-staging`
- **Namespace:** `idem-idp-staging`
- **dns.prefix:** `staging.`
- **image.tag:** `latest`
- **env.LOG_LEVEL:** `info`

### idem-idp-prod

Same as dev, but with:
- **Application Name:** `idem-idp-prod`
- **Namespace:** `idem-idp-prod`
- **Sync Policy:** Manual (no auto-sync for prod)
- **dns.prefix:** `` (empty string)
- **image.tag:** `v1.0.0` (or specific version)
- **env.LOG_LEVEL:** `warn`
- **replicaCount:** `2`

## Secrets Setup

Before syncing applications, create secrets in each namespace:

```bash
# Dev
kubectl create namespace idem-idp-dev
kubectl create secret generic idem-idp-secrets -n idem-idp-dev \
  --from-literal=IDEM_DATABASE_URL='postgresql://user:pass@host:5432/idem_dev' \
  --from-literal=IDEM_ISSUER='https://dev.idem.app.domain.no' \
  --from-literal=IDEM_ADMIN_URL='https://admin.dev.idem.app.domain.no'

# Staging
kubectl create namespace idem-idp-staging
kubectl create secret generic idem-idp-secrets -n idem-idp-staging \
  --from-literal=IDEM_DATABASE_URL='postgresql://user:pass@host:5432/idem_staging' \
  --from-literal=IDEM_ISSUER='https://staging.idem.app.domain.no' \
  --from-literal=IDEM_ADMIN_URL='https://admin.staging.idem.app.domain.no'

# Prod
kubectl create namespace idem-idp-prod
kubectl create secret generic idem-idp-secrets -n idem-idp-prod \
  --from-literal=IDEM_DATABASE_URL='postgresql://user:pass@host:5432/idem_prod' \
  --from-literal=IDEM_ISSUER='https://idem.app.domain.no' \
  --from-literal=IDEM_ADMIN_URL='https://admin.idem.app.domain.no'
```

## ReferenceGrants for TLS

Each app namespace needs a ReferenceGrant for the Gateway to access its TLS secret:

```bash
for ns in idem-idp-dev idem-idp-staging idem-idp-prod; do
  kubectl apply -f - <<EOF
apiVersion: gateway.networking.k8s.io/v1beta1
kind: ReferenceGrant
metadata:
  name: allow-traefik-tls
  namespace: $ns
spec:
  from:
    - group: gateway.networking.k8s.io
      kind: Gateway
      namespace: traefik
  to:
    - group: ""
      kind: Secret
      name: idem-idp-tls
EOF
done
```

## Image Tagging Strategy

| Tag | Description | Used in |
|-----|-------------|---------|
| `canary` | Latest CI build from main | dev |
| `latest` | Latest stable release | staging |
| `v1.2.3` | Semantic version | prod |
| `sha-abc123` | Specific commit | debugging |

## Deployment Flow

1. **PR merged to main** → CI builds and pushes `canary` tag → dev auto-syncs
2. **Release created** → CI builds and pushes `latest` + `v1.2.3` → staging auto-syncs
3. **Manual promotion** → Update prod app to new version tag → manual sync
