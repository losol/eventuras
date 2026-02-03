# Kubernetes Cluster Setup

Setup guide for UpCloud Kubernetes cluster with Traefik, cert-manager, and Argo CD.

## Prerequisites

- UpCloud Kubernetes cluster
- kubectl configured with cluster access
- Helm installed
- DNS wildcard record: `*.app.domain.no` → LoadBalancer IP

## Setup Script

```sh
# 1. Set KUBECONFIG (fish shell)
set -gx KUBECONFIG /path/to/your/kubeconfig.yaml

# 2. Install Gateway API CRDs (v1.4.0)
kubectl apply -f https://github.com/kubernetes-sigs/gateway-api/releases/download/v1.4.0/standard-install.yaml

# 3. Create traefik namespace and install official RBAC
kubectl create namespace traefik
kubectl apply -f https://raw.githubusercontent.com/traefik/traefik/v3.6/docs/content/reference/dynamic-configuration/kubernetes-gateway-rbac.yml

# 4. Add Traefik Helm repo
helm repo add traefik https://traefik.github.io/charts
helm repo update

# 5. Install Traefik via Helm with Gateway API
# Uses high ports (8000/8443) to avoid running as root
# LoadBalancer translates: 80→8000, 443→8443
cat <<'EOF' > /tmp/traefik-values.yaml
providers:
  kubernetesGateway:
    enabled: true
  kubernetesIngress:
    enabled: false
deployment:
  kind: DaemonSet
service:
  type: ClusterIP
hostNetwork: true
updateStrategy:
  rollingUpdate:
    maxUnavailable: 1
    maxSurge: 0
gateway:
  enabled: false
ports:
  web:
    port: 8000
  websecure:
    port: 8443
EOF
helm install traefik traefik/traefik -n traefik -f /tmp/traefik-values.yaml

# 6. Install cert-manager with Gateway API support
helm repo add jetstack https://charts.jetstack.io
helm repo update
helm install cert-manager jetstack/cert-manager \
  -n cert-manager --create-namespace \
  --set crds.enabled=true \
  --set extraArgs="{--enable-gateway-api}"

# 7. Create Cloudflare API token secret for DNS01 challenge
# Get token from https://dash.cloudflare.com/profile/api-tokens
# Required permissions: Zone:DNS:Edit, Zone:Zone:Read for your domain
kubectl create secret generic cloudflare-api-token \
  --namespace cert-manager \
  --from-literal=api-token=<YOUR-CLOUDFLARE-API-TOKEN>

# 8. Create ClusterIssuer with Cloudflare DNS01 (enables wildcard certs)
kubectl apply -f - <<'EOF'
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: user@domain
    privateKeySecretRef:
      name: letsencrypt-prod-key
    solvers:
      - dns01:
          cloudflare:
            apiTokenSecretRef:
              name: cloudflare-api-token
              key: api-token
        selector:
          dnsZones:
            - "yourdomain.no"
EOF

# 9. Create wildcard certificate (in traefik namespace for easy Gateway access)
kubectl apply -f - <<'EOF'
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: wildcard-app-domain
  namespace: traefik
spec:
  secretName: wildcard-app-domain-tls
  issuerRef:
    name: letsencrypt-prod
    kind: ClusterIssuer
  dnsNames:
    - "*.app.domain.no"
    - "app.domain.no"
EOF

# 10. Create Gateway with wildcard HTTPS listener
kubectl apply -f - <<'EOF'
apiVersion: gateway.networking.k8s.io/v1
kind: Gateway
metadata:
  name: traefik-gateway
  namespace: traefik
spec:
  gatewayClassName: traefik
  listeners:
    - name: http
      port: 8000
      protocol: HTTP
      allowedRoutes:
        namespaces:
          from: All
    - name: https
      port: 8443
      protocol: HTTPS
      hostname: "*.app.domain.no"
      tls:
        mode: Terminate
        certificateRefs:
          - kind: Secret
            name: wildcard-app-domain-tls
      allowedRoutes:
        namespaces:
          from: All
EOF

# 11. Install Argo CD
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# 12. Patch Argo CD for insecure mode (TLS handled by gateway)
kubectl -n argocd patch deployment argocd-server --type='json' \
  -p='[{"op": "add", "path": "/spec/template/spec/containers/0/args/-", "value": "--insecure"}]'

# 13. Create Argo CD HTTPRoute (uses wildcard cert, no ReferenceGrant needed)
kubectl apply -f - <<'EOF'
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: argocd
  namespace: argocd
spec:
  parentRefs:
    - name: traefik-gateway
      namespace: traefik
      sectionName: https
  hostnames:
    - argo.app.domain.no
  rules:
    - matches:
        - path:
            type: PathPrefix
            value: /
      backendRefs:
        - name: argocd-server
          port: 80
EOF

# 14. Get Argo CD admin password
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d && echo
```

## Manual Steps After Script

1. **DNS**: Ensure `*.app.domain.no` points to the LoadBalancer IP
2. **LoadBalancer**: Configure port translation:
   - Frontend 80 → Backend 8000
   - Frontend 443 → Backend 8443
3. **Wait for certificate**: `kubectl get certificate -n traefik -w` (wait for READY=True)
4. **Argo CD**: Log in at https://argo.app.domain.no with username `admin`
5. **GitHub App**: Add repository connection via GitHub App in Argo CD Settings → Repositories
6. **Applications**: Create Argo CD Applications for each environment

## Adding New Applications

### 1. Create Namespace

```sh
kubectl create namespace my-app-dev
```

### 2. Create HTTPRoute

With the wildcard certificate (`*.app.domain.no`), new applications only need an HTTPRoute - no per-app certificates or ReferenceGrants required:

```yaml
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: my-app
  namespace: my-app-dev
spec:
  parentRefs:
    - name: traefik-gateway
      namespace: traefik
      sectionName: https  # Uses wildcard listener
  hostnames:
    - my-app.app.domain.no
  rules:
    - matches:
        - path:
            type: PathPrefix
            value: /
      backendRefs:
        - name: my-app
          port: 80
```

### 4. Create HTTPRoute

```yaml
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: my-app
  namespace: my-app-dev
spec:
  parentRefs:
    - name: traefik-gateway
      namespace: traefik
      sectionName: https-my-app
  hostnames:
    - my-app.app.domain.no
  rules:
    - matches:
        - path:
            type: PathPrefix
            value: /
      backendRefs:
        - name: my-app-service
          port: 80
```

### 5. Configure Environment Variables

Use ConfigMaps for non-sensitive configuration and Secrets for sensitive values:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: my-app-config
  namespace: my-app-dev
data:
  NODE_ENV: "production"
  APP_URL: "https://my-app.app.domain.no"
---
apiVersion: v1
kind: Secret
metadata:
  name: my-app-secrets
  namespace: my-app-dev
type: Opaque
stringData:
  DATABASE_URL: "postgresql://user:password@host:5432/database"
```

Then reference them in the Deployment:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
  namespace: my-app-dev
spec:
  template:
    spec:
      containers:
        - name: my-app
          envFrom:
            - configMapRef:
                name: my-app-config
            - secretRef:
                name: my-app-secrets
          # Or reference individual keys:
          env:
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: my-app-secrets
                  key: DATABASE_URL
```

## HTTP to HTTPS Redirect

All HTTP traffic is automatically redirected to HTTPS via an HTTPRoute:

```yaml
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: http-to-https-redirect
  namespace: traefik
spec:
  parentRefs:
    - name: traefik-gateway
      namespace: traefik
      sectionName: http
  rules:
    - filters:
        - type: RequestRedirect
          requestRedirect:
            scheme: https
            statusCode: 301
```

## Architecture

- **Traefik**: Ingress controller using Gateway API (Helm, DaemonSet with hostNetwork on ports 8000/8443)
- **cert-manager**: Automatic TLS certificates from Let's Encrypt
- **Argo CD**: GitOps deployments from this repository
- **LoadBalancer**: Cloud provider translates 80→8000, 443→8443 to Traefik
- **Per-hostname listeners**: Each application gets its own HTTPS listener with dedicated TLS certificate
