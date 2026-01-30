# ADR 0012 — Deployment Model

## Status

Accepted (Updated 2026-01-19 for single-tenant architecture)

## Context

OIDC issuers, keys, cookies, and upstream credentials must never be shared across environments. With Idem serving Eventuras applications exclusively, we need clear separation between development, staging, and production while avoiding the complexity of multi-tenancy.

## Decision

### Single-Tenant, Multi-Environment Architecture

Deploy **one single-tenant instance per environment**, each completely isolated:

| Aspect | Separation Strategy |
|--------|---------------------|
| **Deployments** | Separate server instances (dev local, staging cloud, prod cloud) |
| **Databases** | Separate PostgreSQL databases (`idem_dev`, `idem_staging`, `idem_prod`) |
| **Issuers** | One issuer per environment (no multi-tenancy, no hostname resolution) |
| **Keys** | Separate signing keys per environment (never share) |
| **IdP Configs** | Environment-specific (mock dev, test staging, prod) |
| **Secrets** | Separate secrets per environment (never reuse passwords/keys) |

### Issuer URLs

```typescript
// Single issuer per environment (no multi-tenancy)
const ISSUERS = {
  development: 'http://localhost:3200',
  staging: 'https://auth-staging.eventuras.com',
  production: 'https://auth.eventuras.com',
};

// No tenant resolution, no hostname matching
// Just one static issuer per deployment
export const issuer = ISSUERS[process.env.NODE_ENV];
```

### Deployment Strategy

**Development (Local):**

```bash
# Each developer runs locally
cd apps/idem-idp
pnpm dev  # http://localhost:3200

# Database: Local PostgreSQL or SQLite
# IdPs: Mock Vipps, Mock HelseID
# Keys: Generated locally, stored in local DB
# No secrets needed (all mocked)
```

**Staging (Cloud):**

```bash
# Deployed to staging infrastructure
NODE_ENV=staging pnpm build
NODE_ENV=staging pnpm start

# Database: staging.postgres.eventuras.com/idem_staging
# IdPs: Vipps Test (apitest.vipps.no), HelseID Test
# Keys: Staging-specific signing keys
# Secrets: Staging credentials (separate from prod)
```

**Production (Cloud):**

```bash
# Deployed to production infrastructure
NODE_ENV=production pnpm build
NODE_ENV=production pnpm start

# Database: prod.postgres.eventuras.com/idem_prod
# IdPs: Vipps Prod (api.vipps.no), HelseID Prod
# Keys: Production signing keys (KMS-backed)
# Secrets: Production credentials (KMS-backed)
```

### Frontend/Backend Co-Location

**Integrated Deployment (Recommended):**

```
┌─────────────────────────────────────┐
│  https://auth.eventuras.com         │
│                                     │
│  ┌──────────────┐  ┌──────────────┐│
│  │ Next.js      │  │ Express      ││
│  │ (Admin UI)   │  │ (OIDC API)   ││
│  │              │  │              ││
│  │ /admin/*     │  │ /.well-known ││
│  │ /interaction │  │ /token       ││
│  └──────────────┘  │ /authorize   ││
│                    │ /userinfo    ││
│                    └──────────────┘│
└─────────────────────────────────────┘
```

**Single deployment** contains both frontend and backend:
- Simpler deployment (one build, one container)
- No CORS issues (same origin)
- Shared session/cookies
- Faster communication (no network hop)

### Database Isolation

**Strict Separation:**

```sql
-- Development database
CREATE DATABASE idem;
-- Contains: Test accounts, mock data, dev OAuth clients

-- Staging database (separate server)
CREATE DATABASE idem_staging;
-- Contains: QA test accounts, staging OAuth clients

-- Production database (separate server, with backups)
CREATE DATABASE idem_prod;
-- Contains: Real user accounts, production OAuth clients
-- Backups: Daily snapshots, point-in-time recovery
```

**No Shared Data:**
- User accounts are environment-specific
- OAuth clients are environment-specific
- Signing keys are environment-specific
- Absolutely zero connection between environments

### Secrets Management

**Environment-Specific Secrets:**

```yaml
# .env.development (local, can be committed)
NODE_ENV=development
DATABASE_URL=postgresql://localhost/idem
# No real secrets needed

# .env.staging (stored in CI/CD)
NODE_ENV=staging
DATABASE_URL=postgresql://staging.postgres/idem_staging
MASTER_KEY=<staging-master-key>
VIPPS_CLIENT_ID=<vipps-test-client-id>
VIPPS_CLIENT_SECRET=<vipps-test-secret>
HELSEID_CLIENT_ID=<helseid-test-client-id>
HELSEID_CLIENT_SECRET=<helseid-test-secret>

# .env.production (stored in KMS/Vault)
NODE_ENV=production
DATABASE_URL=postgresql://prod.postgres/idem_prod
MASTER_KEY=<production-master-key>  # KMS-backed
VIPPS_CLIENT_ID=<vipps-prod-client-id>
VIPPS_CLIENT_SECRET=<vipps-prod-secret>  # KMS-backed
HELSEID_CLIENT_ID=<helseid-prod-client-id>
HELSEID_CLIENT_SECRET=<helseid-prod-secret>  # KMS-backed
```

**Never Reuse Secrets:**
- Staging and production use completely different credentials
- If staging is compromised, production is unaffected
- Separate KMS keys for staging and production

### Infrastructure as Code

**Terraform/Kubernetes Config:**

```hcl
# Single-tenant deployment per environment
module "idem_staging" {
  source = "./modules/idem"

  environment = "staging"
  issuer_url  = "https://auth-staging.eventuras.com"
  database_name = "idem_staging"

  # Separate infrastructure
  instance_type = "t3.small"  # Smaller for staging
  replica_count = 1
}

module "idem_production" {
  source = "./modules/idem"

  environment = "production"
  issuer_url  = "https://auth.eventuras.com"
  database_name = "idem_prod"

  # Larger infrastructure for production
  instance_type = "t3.large"
  replica_count = 3  # High availability

  # Production-specific features
  enable_kms     = true
  enable_backups = true
  enable_alerts  = true
}
```

### Deployment Pipeline

**CI/CD Flow:**

```yaml
# .github/workflows/deploy.yml
name: Deploy Idem

on:
  push:
    branches:
      - main        # Auto-deploy to staging
      - production  # Manual approval to prod

jobs:
  deploy_staging:
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Build
        run: NODE_ENV=staging pnpm build
      - name: Deploy to staging
        run: ./deploy.sh staging

  deploy_production:
    if: github.ref == 'refs/heads/production'
    runs-on: ubuntu-latest
    environment: production  # Requires manual approval
    steps:
      - name: Build
        run: NODE_ENV=production pnpm build
      - name: Deploy to production
        run: ./deploy.sh production
      - name: Smoke tests
        run: pnpm test:smoke:prod
```

## Consequences

### Positive

- **Complete Isolation**: Environments cannot affect each other
- **Simpler Architecture**: No multi-tenancy complexity
- **Clear Mental Model**: "One deployment = one environment"
- **Easier Debugging**: No "which tenant?" questions
- **Faster Development**: Removed 30-40% of complexity
- **Lower Risk**: Staging issues don't impact production

### Negative

- **More Infrastructure**: 3 separate deployments (cost)
- **More Configuration**: Environment-specific config files
- **Coordination Overhead**: Developers need access to all environments

### Comparison: Old (Multi-Tenant) vs New (Single-Tenant)

| Aspect | Old (Multi-Tenant) | New (Single-Tenant) |
|--------|-------------------|---------------------|
| **Deployments** | 3 deployments × N tenants | 3 deployments total |
| **Issuers** | N issuers per environment | 1 issuer per environment |
| **Databases** | Tenant filtering on every query | Simple queries, no filtering |
| **Complexity** | High (tenant resolution) | Low (static config) |
| **Code Size** | ~40% larger | Baseline |
| **Development Time** | +1-2 months | Baseline |

### Risks and Mitigations

**Risk: Config drift between staging and production**
- **Mitigation**: Infrastructure as Code (Terraform)
- **Mitigation**: Automated smoke tests after deployment
- **Mitigation**: Configuration validation in CI/CD

**Risk: Developers accidentally deploy to wrong environment**
- **Mitigation**: CI/CD enforces branch → environment mapping
- **Mitigation**: Startup validation checks NODE_ENV
- **Mitigation**: Manual approval required for production

**Risk: Staging doesn't catch production-specific issues**
- **Mitigation**: Staging uses production-like configuration
- **Mitigation**: Load testing in staging before prod deployment
- **Mitigation**: Canary deployments in production

## Testing Strategy

### Automated Tests

```typescript
describe('Deployment Model', () => {
  it('should use correct issuer per environment', () => {
    process.env.NODE_ENV = 'development';
    expect(getIssuer()).toBe('http://localhost:3200');

    process.env.NODE_ENV = 'staging';
    expect(getIssuer()).toBe('https://auth-staging.eventuras.com');

    process.env.NODE_ENV = 'production';
    expect(getIssuer()).toBe('https://auth.eventuras.com');
  });

  it('should use correct IdP config per environment', () => {
    process.env.NODE_ENV = 'development';
    expect(getIdPConfig('vipps').type).toBe('mock');

    process.env.NODE_ENV = 'staging';
    expect(getIdPConfig('vipps').issuer).toContain('apitest.vipps.no');

    process.env.NODE_ENV = 'production';
    expect(getIdPConfig('vipps').issuer).toContain('api.vipps.no');
  });

  it('should never share database connections across environments', () => {
    // This should be enforced by infrastructure, not code
    // But we can verify config is environment-specific
    process.env.NODE_ENV = 'staging';
    expect(getDatabaseUrl()).toContain('idem_staging');

    process.env.NODE_ENV = 'production';
    expect(getDatabaseUrl()).toContain('idem_prod');
  });
});
```

### Manual Verification

Before each deployment:

- [ ] Verify NODE_ENV is set correctly
- [ ] Verify issuer URL matches environment
- [ ] Verify database connection string matches environment
- [ ] Verify IdP configurations are environment-specific
- [ ] Verify no dev features enabled in staging/prod
- [ ] Test OIDC discovery endpoint (/.well-known/openid-configuration)
- [ ] Verify JWKS endpoint returns environment-specific keys

### Smoke Tests (Post-Deployment)

```bash
# Staging smoke tests
curl -f https://auth-staging.eventuras.com/.well-known/openid-configuration
curl -f https://auth-staging.eventuras.com/.well-known/jwks.json
curl -f https://auth-staging.eventuras.com/healthz

# Production smoke tests (same, different URL)
curl -f https://auth.eventuras.com/.well-known/openid-configuration
curl -f https://auth.eventuras.com/.well-known/jwks.json
curl -f https://auth.eventuras.com/healthz
```

## References

- ADR 0002: Environment Model
- ADR 0003: Development Shortcuts
- ADR 0013: Secrets Management
- ADR 0014: Security Hardening Baseline
