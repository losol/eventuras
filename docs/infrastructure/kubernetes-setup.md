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

# 2. Install Gateway API CRDs
kubectl apply -f https://github.com/kubernetes-sigs/gateway-api/releases/download/v1.0.0/standard-install.yaml

# 3. Create traefik namespace and RBAC
kubectl create namespace traefik

kubectl apply -f - <<'EOF'
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: traefik-gateway-controller
rules:
  - apiGroups: [""]
    resources: ["services", "endpoints", "secrets"]
    verbs: ["get", "list", "watch"]
  - apiGroups: ["gateway.networking.k8s.io"]
    resources: ["gateways", "httproutes", "referencegrants"]
    verbs: ["get", "list", "watch"]
  - apiGroups: ["gateway.networking.k8s.io"]
    resources: ["gateways/status", "httproutes/status"]
    verbs: ["update"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: traefik-gateway-controller
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: traefik-gateway-controller
subjects:
  - kind: ServiceAccount
    name: traefik
    namespace: traefik
EOF

# 4. Install Traefik DaemonSet
kubectl apply -f - <<'EOF'
apiVersion: v1
kind: ServiceAccount
metadata:
  name: traefik
  namespace: traefik
---
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: traefik
  namespace: traefik
spec:
  selector:
    matchLabels:
      app: traefik
  template:
    metadata:
      labels:
        app: traefik
    spec:
      serviceAccountName: traefik
      automountServiceAccountToken: true
      hostNetwork: true
      containers:
        - name: traefik
          image: traefik:v3.0
          args:
            - --providers.kubernetesgateway
            - --providers.kubernetesingress=true
            - --entrypoints.web.address=:80
            - --entrypoints.websecure.address=:443
          ports:
            - containerPort: 80
            - containerPort: 443
EOF

# 5. Create GatewayClass and Gateway
kubectl apply -f - <<'EOF'
apiVersion: gateway.networking.k8s.io/v1
kind: GatewayClass
metadata:
  name: traefik
spec:
  controllerName: traefik.io/gateway-controller
---
apiVersion: gateway.networking.k8s.io/v1
kind: Gateway
metadata:
  name: traefik-gateway
  namespace: traefik
spec:
  gatewayClassName: traefik
  listeners:
    - name: http
      port: 80
      protocol: HTTP
      allowedRoutes:
        namespaces:
          from: All
    - name: https
      port: 443
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

# 6. Install cert-manager with Gateway API support
helm repo add jetstack https://charts.jetstack.io
helm repo update
helm install cert-manager jetstack/cert-manager \
  -n cert-manager --create-namespace \
  --set crds.enabled=true \
  --set extraArgs="{--enable-gateway-api}"

# 7. Create ClusterIssuer for Let's Encrypt

Remember to replace `user@domain` with your actual email address.


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

# 8. Install Argo CD
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# 9. Patch Argo CD for insecure mode (TLS handled by gateway)
kubectl -n argocd patch deployment argocd-server --type='json' \
  -p='[{"op": "add", "path": "/spec/template/spec/containers/0/args/-", "value": "--insecure"}]'

# 10. Create ReferenceGrant for TLS certificate access
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

# 11. Create Argo CD Certificate and HTTPRoute
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

# 12. Get Argo CD admin password
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d && echo
```

## Manual Steps After Script

1. **DNS**: Ensure `*.app.domain.no` points to the LoadBalancer IP
2. **Argo CD**: Log in at https://argo.app.domain.no with username `admin`
3. **GitHub App**: Add repository connection via GitHub App in Argo CD Settings → Repositories
4. **Applications**: Create Argo CD Applications for each environment

## Architecture

- **Traefik**: Ingress controller using Gateway API (DaemonSet with hostNetwork)
- **cert-manager**: Automatic TLS certificates from Let's Encrypt
- **Argo CD**: GitOps deployments from this repository
- **LoadBalancer**: cloud provider TCP pass-through to Traefik
