# pgAdmin 4

PostgreSQL administration tool for Kubernetes.

## Quick Start

```bash
kubectl create namespace pgadmin

helm install pgadmin ./chart \
  --namespace pgadmin \
  --set pgadmin.defaultPassword="$(openssl rand -base64 24)"
```

Access via port-forward:

```bash
kubectl port-forward -n pgadmin svc/pgadmin 5050:5050
open http://localhost:5050
```

Login:

- **Email:** `admin@example.com`
- **Password:** `kubectl get secret pgadmin-secrets -n pgadmin -o jsonpath='{.data.password}' | base64 -d`

## With Traefik + IP Whitelist + OIDC

For external access with defense in depth.

### 1. Create OIDC Secret

First, create a JSON file for the OAuth2 config:

```bash
cat <<'EOF' > pgadmin-oauth2-config.json
[{
  "OAUTH2_NAME": "oidc",
  "OAUTH2_DISPLAY_NAME": "Login with SSO",
  "OAUTH2_CLIENT_ID": "pgadmin",
  "OAUTH2_CLIENT_SECRET": "your-client-secret-here",
  "OAUTH2_TOKEN_URL": "https://id.example.com/oauth/token",
  "OAUTH2_AUTHORIZATION_URL": "https://id.example.com/oauth/authorize",
  "OAUTH2_USERINFO_ENDPOINT": "https://id.example.com/oauth/userinfo",
  "OAUTH2_SERVER_METADATA_URL": "https://id.example.com/.well-known/openid-configuration",
  "OAUTH2_SCOPE": "openid email profile",
  "OAUTH2_USERNAME_CLAIM": "email",
  "OAUTH2_ICON": "fa-openid",
  "OAUTH2_BUTTON_COLOR": "#2563eb"
}]
EOF
```

Then create the secret:

```bash
kubectl create secret generic pgadmin-oidc-config \
  --namespace pgadmin \
  --from-literal=PGADMIN_CONFIG_AUTHENTICATION_SOURCES="['oauth2']" \
  --from-literal=PGADMIN_CONFIG_OAUTH2_AUTO_CREATE_USER="True" \
  --from-file=PGADMIN_CONFIG_OAUTH2_CONFIG=pgadmin-oauth2-config.json
```

### 2. Create values file

```yaml
# values-traefik.yaml
traefik:
  enabled: true
  hostname: "pgadmin.example.com"
  tls:
    certResolver: letsencrypt
  ipWhitelist:
    enabled: true
    sourceRange:
      - "1.2.3.4/32"  # Your IP

oidc:
  enabled: true
  secretRef:
    name: pgadmin-oidc-config
```

### 3. Install

```bash
helm install pgadmin ./chart -f values-traefik.yaml --namespace pgadmin \
  --set pgadmin.defaultPassword="$(openssl rand -base64 24)"
```

## Helm Values

| Parameter | Description | Default |
| --------- | ----------- | ------- |
| `pgadmin.defaultEmail` | Admin email | `admin@example.com` |
| `pgadmin.defaultPassword` | Admin password | *Required* |
| `persistence.enabled` | Enable PVC | `true` |
| `traefik.enabled` | Enable Traefik IngressRoute | `false` |
| `traefik.hostname` | External hostname | `""` |
| `traefik.ipWhitelist.enabled` | Enable IP whitelist | `false` |
| `oidc.enabled` | Enable OIDC | `false` |
| `oidc.secretRef.name` | OIDC config secret | `""` |

## Uninstall

```bash
helm uninstall pgadmin -n pgadmin
kubectl delete pvc pgadmin-pvc -n pgadmin
```
