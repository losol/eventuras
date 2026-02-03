# Traefik Gateway Helm Chart

Helm chart for Traefik Gateway with wildcard TLS certificates using cert-manager and Cloudflare DNS01.

## Prerequisites

1. **cert-manager** installed in the cluster
2. **Cloudflare API token** with permissions:
   - Zone:DNS:Edit
   - Zone:Zone:Read

## Installation

### 1. Create Cloudflare API Token Secret

```bash
kubectl create secret generic cloudflare-api-token \
  --namespace cert-manager \
  --from-literal=api-token=<YOUR-CLOUDFLARE-API-TOKEN>
```

### 2. Create values file for your environment

```yaml
# values-prod.yaml
domain: app.example.com

additionalDomains:
  - name: idem
    domain: idem.example.com

letsencrypt:
  email: admin@example.com

cloudflare:
  dnsZone: example.com
```

### 3. Install the chart

```bash
# From the infra directory
helm install traefik-gateway ./traefik-gateway -f values-prod.yaml

# Or upgrade existing
helm upgrade traefik-gateway ./traefik-gateway -f values-prod.yaml
```

## Values

| Value | Description | Default |
|-------|-------------|---------|
| `domain` | Primary wildcard domain | `example.com` |
| `additionalDomains` | List of additional wildcard domains | `[{name: idem, domain: idem.example.com}]` |
| `letsencrypt.email` | Email for Let's Encrypt | `admin@example.com` |
| `letsencrypt.server` | ACME server URL | Let's Encrypt production |
| `cloudflare.dnsZone` | Cloudflare DNS zone | `example.com` |
| `cloudflare.apiTokenSecret.name` | Secret name for API token | `cloudflare-api-token` |
| `gateway.name` | Gateway resource name | `traefik-gateway` |
| `gateway.namespace` | Gateway namespace | `traefik` |
| `gateway.httpPort` | HTTP listener port | `8000` |
| `gateway.httpsPort` | HTTPS listener port | `8443` |

## Generated Resources

- **ClusterIssuer**: `letsencrypt-prod` - Cloudflare DNS01 solver
- **Certificate**: `wildcard-<domain>` - Wildcard cert for all domains
- **Gateway**: `traefik-gateway` - Gateway with HTTPS listeners

## Adding New Domains

Add to `additionalDomains` in your values file:

```yaml
additionalDomains:
  - name: idem
    domain: idem.example.com
  - name: api
    domain: api.example.com
```

Each domain gets:
- DNS names added to the certificate
- A dedicated HTTPS listener named `https-<name>`

## HTTPRoute Configuration

Reference the listeners in your HTTPRoutes:

```yaml
# For *.app.example.com
parentRefs:
  - name: traefik-gateway
    namespace: traefik
    sectionName: https

# For *.idem.example.com
parentRefs:
  - name: traefik-gateway
    namespace: traefik
    sectionName: https-idem
```
