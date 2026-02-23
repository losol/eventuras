# Monitoring Setup

Prometheus and Grafana monitoring stack for the Kubernetes cluster.

## Prerequisites

- Kubernetes cluster with Traefik Gateway API configured
- cert-manager with Let's Encrypt ClusterIssuer
- Helm installed

## Installation

### Prerequisites

Add the required Helm repos (needed for `helm dependency update`):

```sh
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo add grafana https://grafana.github.io/helm-charts
helm repo update
```

### Option A: Argo CD (recommended)

Argo CD will keep the stack in sync with the repo automatically.

```sh
# 1. Create the Grafana admin password secret (one-time, manual step)
kubectl create secret generic monitoring-grafana-admin \
  -n monitoring \
  --from-literal=admin-user=admin \
  --from-literal=admin-password=<your-password>

# 2. Apply the ArgoCD Application
kubectl apply -f infra/monitoring/argocd-application.yaml
```

Argo CD will then fetch the chart from the repo, run `helm dependency update`, and deploy.

### Option B: Manual Helm

```sh
# 1. Create the Grafana admin password secret (one-time, manual step)
kubectl create secret generic monitoring-grafana-admin \
  -n monitoring \
  --from-literal=admin-user=admin \
  --from-literal=admin-password=<your-password>

# 2. Fetch chart dependencies
helm dependency update infra/monitoring/chart

# 3. Install (or upgrade) the full monitoring stack
helm upgrade --install monitoring infra/monitoring/chart \
  -n monitoring --create-namespace \
  -f infra/monitoring/chart/values.prod.yaml
```

## Access

- **Grafana**: https://grafana.app.losol.no
  - Username: `admin`
  - Password: (set during installation)

## Included Components

The chart installs:

- **Prometheus**: Metrics collection and storage
- **Grafana**: Visualization and dashboards
- **Alertmanager**: Alert routing and notifications
- **Node Exporter**: Host-level metrics
- **kube-state-metrics**: Kubernetes object metrics
- **Loki**: Log aggregation and storage
- **Alloy**: Log/metrics/traces collection agent (forwards pod logs to Loki)

## Pre-configured Dashboards

Grafana comes with dashboards for:

- Kubernetes cluster overview
- Node resources (CPU, memory, disk, network)
- Pod resources
- Namespace resources
- Persistent volumes
- API server metrics

## Logs (Loki)

Logs from all pods are collected by Alloy and stored in Loki. Query them in Grafana under **Explore → Loki** using LogQL, e.g.:

```logql
{namespace="default"} |= "error"
```

### Useful Loki Dashboards

Import from [Grafana.com](https://grafana.com/grafana/dashboards/):

| Dashboard ID | Description |
|---|---|
| `15141` | Kubernetes / Logs / Namespaces |
| `13639` | Loki stack – resource monitoring |

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
