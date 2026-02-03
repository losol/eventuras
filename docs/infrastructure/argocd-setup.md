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
   - **Path:** `apps/<app>/chart`

4. **Destination:**
   - **Cluster URL:** `https://kubernetes.default.svc`
   - **Namespace:** `<app>-<env>`

5. **Helm** section - add environment-specific parameters (see each app's chart README)

6. Click **Create**

### Application-specific Setup

See each application's chart README for detailed setup instructions:

- [idem-idp](../../apps/idem-idp/chart/README.md#argo-cd-application-setup)

## Secrets Setup

Before syncing applications, create required secrets in each namespace. See each application's chart README for specific secret requirements:

- [idem-idp secrets](../../apps/idem-idp/chart/README.md#required-secrets)

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
