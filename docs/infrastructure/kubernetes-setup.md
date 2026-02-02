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

# 6. Create Gateway
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
      allowedRoutes:
        namespaces:
          from: All
      tls:
        mode: Terminate
        certificateRefs:
          - kind: Secret
            name: argocd-tls
            namespace: argocd
EOF

# 7. Install cert-manager with Gateway API support
helm repo add jetstack https://charts.jetstack.io
helm repo update
helm install cert-manager jetstack/cert-manager \
  -n cert-manager --create-namespace \
  --set crds.enabled=true \
  --set extraArgs="{--enable-gateway-api}"

# 8. Create ClusterIssuer for Let's Encrypt
# Remember to replace `user@domain` with your actual email address.
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
      - http01:
          gatewayHTTPRoute:
            parentRefs:
              - name: traefik-gateway
                namespace: traefik
                kind: Gateway
EOF

# 9. Install Argo CD
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# 10. Patch Argo CD for insecure mode (TLS handled by gateway)
kubectl -n argocd patch deployment argocd-server --type='json' \
  -p='[{"op": "add", "path": "/spec/template/spec/containers/0/args/-", "value": "--insecure"}]'

# 11. Create ReferenceGrant for TLS certificate access
kubectl apply -f - <<'EOF'
apiVersion: gateway.networking.k8s.io/v1beta1
kind: ReferenceGrant
metadata:
  name: allow-traefik-tls
  namespace: argocd
spec:
  from:
    - group: gateway.networking.k8s.io
      kind: Gateway
      namespace: traefik
  to:
    - group: ""
      kind: Secret
      name: argocd-tls
EOF

# 12. Create Argo CD Certificate and HTTPRoute
kubectl apply -f - <<'EOF'
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: argocd-tls
  namespace: argocd
spec:
  secretName: argocd-tls
  issuerRef:
    name: letsencrypt-prod
    kind: ClusterIssuer
  dnsNames:
    - argo.app.domain.no
---
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

# 13. Get Argo CD admin password
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d && echo
```

## Manual Steps After Script

1. **DNS**: Ensure `*.app.domain.no` points to the LoadBalancer IP
2. **LoadBalancer**: Configure port translation:
   - Frontend 80 → Backend 8000
   - Frontend 443 → Backend 8443
3. **Argo CD**: Log in at https://argo.app.domain.no with username `admin`
4. **GitHub App**: Add repository connection via GitHub App in Argo CD Settings → Repositories
5. **Applications**: Create Argo CD Applications for each environment

## Adding New Applications

### 1. Create Namespace

```sh
kubectl create namespace my-app-dev
```

### 2. Create Certificate and ReferenceGrant

Each application needs a TLS certificate and a ReferenceGrant to allow the Gateway to access it:

```yaml
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: my-app-tls
  namespace: my-app-dev
spec:
  secretName: my-app-tls
  issuerRef:
    name: letsencrypt-prod
    kind: ClusterIssuer
  dnsNames:
    - my-app.app.domain.no
---
apiVersion: gateway.networking.k8s.io/v1beta1
kind: ReferenceGrant
metadata:
  name: allow-traefik-tls
  namespace: my-app-dev
spec:
  from:
    - group: gateway.networking.k8s.io
      kind: Gateway
      namespace: traefik
  to:
    - group: ""
      kind: Secret
      name: my-app-tls
```

### 3. Add Listener to Gateway

Update the Gateway in `traefik` namespace to add a new HTTPS listener:

```yaml
- name: https-my-app
  port: 8443
  protocol: HTTPS
  hostname: my-app.app.domain.no
  allowedRoutes:
    namespaces:
      from: All
  tls:
    mode: Terminate
    certificateRefs:
      - kind: Secret
        name: my-app-tls
        namespace: my-app-dev
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
