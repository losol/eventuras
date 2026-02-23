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

Token needs: `Zone:DNS:Edit` + `Zone:Zone:Read` for every zone in `additionalDomains`.

### 2. Deploy — choose one approach below

## ArgoCD Deployment (recommended)

The chart is public, but domain names and email must not be committed to the repo.
Fill in `argocd-application.yaml` with real values and apply it once — ArgoCD handles everything from there.

```bash
# Copy the template
cp infra/traefik-gateway/argocd-application.yaml ~/traefik-gateway-app.yaml

# Edit with real values (domain, email, additionalDomains)
$EDITOR ~/traefik-gateway-app.yaml

# Apply once – ArgoCD adopts existing resources and manages from here
kubectl apply -f ~/traefik-gateway-app.yaml
```

## Manual Deployment (alternative)

Create a private values file and upgrade manually:

```bash
# values-prod.yaml (keep outside repo)
domain: app.example.com
letsencrypt:
  email: admin@example.com
cloudflare:
  dnsZone: example.com
additionalDomains:
  - name: idem
    domain: idem.example.com
```

```bash
helm upgrade --install traefik-gateway infra/traefik-gateway \
  -n traefik --create-namespace \
  -f ~/traefik-values.yaml
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

## Ports and External Traffic

The Gateway listeners run on ports `8000` (HTTP) and `8443` (HTTPS). Traefik's Service should map:
- External `80` → `8000`
- External `443` → `8443`

If using a cloud LoadBalancer, verify these port mappings in the Traefik Service. If traffic is not reaching the gateway, check with:

```bash
kubectl get svc -n traefik
kubectl get gateway traefik-gateway -n traefik
```

## HTTPRoute Configuration

Each app creates an HTTPRoute that references a listener by `sectionName`. The hostname in the route **must match the wildcard** for that listener.

```yaml
# For *.app.example.com → use sectionName: https
parentRefs:
  - name: traefik-gateway
    namespace: traefik
    sectionName: https

# For *.idem.example.com → use sectionName: https-idem
parentRefs:
  - name: traefik-gateway
    namespace: traefik
    sectionName: https-idem
```

### Adding a tenant on a custom domain

If a tenant uses a domain not covered by existing listeners (e.g. `api.kursinord.no`), you must:

1. Add the domain to `additionalDomains` in your traefik-gateway values file and upgrade the chart — this adds a new listener and extends the certificate.
2. Create a DNS CNAME/A record pointing to the cluster LoadBalancer IP.
3. Set the correct `sectionName` in the HTTPRoute (e.g. `https-kursinord`).

The `apps/api/k8s/workload` chart defaults to `sectionName: https`. Override via `httpRoute.gateway.sectionName` if needed.
