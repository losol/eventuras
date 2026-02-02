# Monitoring Setup

Prometheus and Grafana monitoring stack for the Kubernetes cluster.

## Prerequisites

- Kubernetes cluster with Traefik Gateway API configured
- cert-manager with Let's Encrypt ClusterIssuer
- Helm installed

## Installation

```sh
# 1. Add Prometheus community Helm repo
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

# 2. Install kube-prometheus-stack
# Replace <your-password> with a secure password
helm install monitoring prometheus-community/kube-prometheus-stack \
  -n monitoring --create-namespace \
  --set grafana.adminPassword='<your-password>'

# 3. Create ReferenceGrant for TLS certificate access
kubectl apply -f - <<'EOF'
apiVersion: gateway.networking.k8s.io/v1beta1
kind: ReferenceGrant
metadata:
  name: allow-traefik-tls
  namespace: monitoring
spec:
  from:
    - group: gateway.networking.k8s.io
      kind: Gateway
      namespace: traefik
  to:
    - group: ""
      kind: Secret
      name: grafana-tls
EOF

# 4. Create Certificate and HTTPRoute for Grafana
kubectl apply -f - <<'EOF'
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: grafana-tls
  namespace: monitoring
spec:
  secretName: grafana-tls
  issuerRef:
    name: letsencrypt-prod
    kind: ClusterIssuer
  dnsNames:
    - grafana.app.domain.no
---
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: grafana
  namespace: monitoring
spec:
  parentRefs:
    - name: traefik-gateway
      namespace: traefik
  hostnames:
    - grafana.app.domain.no
  rules:
    - backendRefs:
        - name: monitoring-grafana
          port: 80
EOF

# 5. Add grafana-tls to Gateway certificate refs
kubectl patch gateway traefik-gateway -n traefik --type='json' -p='[
  {"op": "add", "path": "/spec/listeners/1/tls/certificateRefs/-", "value": {"kind": "Secret", "name": "grafana-tls", "namespace": "monitoring"}}
]'
```

## Access

- **Grafana**: https://grafana.app.domain.no
  - Username: `admin`
  - Password: (set during installation)

## Included Components

The kube-prometheus-stack includes:

- **Prometheus**: Metrics collection and storage
- **Grafana**: Visualization and dashboards
- **Alertmanager**: Alert routing and notifications
- **Node Exporter**: Host-level metrics
- **kube-state-metrics**: Kubernetes object metrics

## Pre-configured Dashboards

Grafana comes with dashboards for:

- Kubernetes cluster overview
- Node resources (CPU, memory, disk, network)
- Pod resources
- Namespace resources
- Persistent volumes
- API server metrics

## Adding Custom Dashboards

Import dashboards from [Grafana.com](https://grafana.com/grafana/dashboards/):

1. Go to Grafana → Dashboards → Import
2. Enter dashboard ID (e.g., `15757` for Kubernetes views)
3. Select Prometheus data source
4. Click Import

## Alerting (Optional)

Configure Alertmanager for notifications:

```sh
kubectl edit secret alertmanager-monitoring-kube-prometheus-alertmanager -n monitoring
```

Add Slack, email, or other notification channels in the `alertmanager.yaml` config.
