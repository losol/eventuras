# ConvertoAPI Kubernetes Deployment

Helm chart for deploying ConvertoAPI as a shared HTML-to-PDF conversion service.

## Overview

The chart creates a Deployment and ClusterIP Service named `converto`.
External access (HTTPRoute, TLS) is configured separately.

## Deployment

### 1. Create secrets

The app requires a Kubernetes secret named `converto-secrets` with:

| Key | Description |
| --- | --- |
| `JWT_SECRET` | Secret for signing JWT tokens |
| `CLIENT_ID` | OAuth client ID |
| `CLIENT_SECRET` | OAuth client secret |

```bash
kubectl create namespace converto

kubectl create secret generic converto-secrets \
  --namespace=converto \
  --from-literal=JWT_SECRET="$(openssl rand -base64 64)" \
  --from-literal=CLIENT_ID="your-client-id" \
  --from-literal=CLIENT_SECRET="your-client-secret"
```

### 2. Install the chart

```bash
helm install converto apps/convertoapi/k8s/chart/ \
  --namespace converto \
  --set image.tag=your-image-tag
```

Or via an ArgoCD Application pointing to `apps/convertoapi/k8s/chart`.

### 3. Connect the Eventuras API

API consumers in other namespaces use the fully qualified service name:

```yaml
config:
  converto:
    pdfEndpointUrl: "http://converto.converto/v1/pdf"
    tokenEndpointUrl: "http://converto.converto/token"
```

The API also needs matching credentials (`Converto__ClientId`, `Converto__ClientSecret`).

## Resource considerations

Playwright spawns a Chromium browser for each PDF render (~200-400 MB memory).
Default limits are 1 Gi memory and 1 CPU core. Adjust via values if needed.

## Local testing

```bash
helm template converto apps/convertoapi/k8s/chart/ --set image.tag=test
```
