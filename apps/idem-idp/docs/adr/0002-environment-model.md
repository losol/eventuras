# ADR 0002 — Environment Model

## Status
Accepted (Updated 2026-01-19 for single-tenant architecture)

## Context

The system must clearly separate development, staging, and production while still allowing developer-friendly workflows in development. With 10 applications depending on Idem and integration with external IdPs (Vipps, HelseID), we need:
- **Development**: Fast local iteration with mock IdPs
- **Staging**: Realistic testing with IdP test environments
- **Production**: Live authentication for Eventuras applications

## Decision

### Environment Strategy: Three Separate Deployments

Idem uses **three completely isolated environments**, each with its own:
- Deployment (server instance)
- Database (PostgreSQL)
- Issuer URL (OIDC issuer)
- IdP configurations (mock vs test vs production)

### Environment Variable

Use `NODE_ENV` as the single source of truth for environment:

```typescript
NODE_ENV = 'development' | 'staging' | 'production'
```

**NOT** using `IDEM_ENV` - simplified to standard Node.js convention.

### Environment Configuration

| Environment | NODE_ENV | Issuer | Database | IdPs |
|------------|----------|--------|----------|------|
| **Development** | `development` | `http://localhost:3200` | `idem_dev` | Mock Vipps, Mock HelseID |
| **Staging** | `staging` | `https://auth-staging.eventuras.com` | `idem_staging` | Vipps Test, HelseID Test |
| **Production** | `production` | `https://auth.eventuras.com` | `idem_prod` | Vipps Prod, HelseID Prod |

### Feature Flags per Environment

```typescript
// server/config.ts
export const config = {
  nodeEnv: process.env.NODE_ENV!,

  issuer: {
    development: 'http://localhost:3200',
    staging: 'https://auth-staging.eventuras.com',
    production: 'https://auth.eventuras.com',
  }[process.env.NODE_ENV!],

  features: {
    // Dev shortcuts (ADR 0018)
    devShortcuts: process.env.NODE_ENV === 'development',
    mockIdPs: process.env.NODE_ENV === 'development',
    devRoutes: process.env.NODE_ENV === 'development',

    // Relaxed security for dev
    requireHttps: process.env.NODE_ENV !== 'development',
    strictCors: process.env.NODE_ENV === 'production',
    strictRateLimits: process.env.NODE_ENV === 'production',
  },

  idps: {
    vipps: {
      development: {
        type: 'mock',
        clientId: 'N/A',
      },
      staging: {
        type: 'real',
        clientId: process.env.VIPPS_TEST_CLIENT_ID!,
        clientSecret: process.env.VIPPS_TEST_CLIENT_SECRET!,
        issuer: 'https://apitest.vipps.no',
      },
      production: {
        type: 'real',
        clientId: process.env.VIPPS_PROD_CLIENT_ID!,
        clientSecret: process.env.VIPPS_PROD_CLIENT_SECRET!,
        issuer: 'https://api.vipps.no',
      },
    }[process.env.NODE_ENV!],

    helseid: {
      development: {
        type: 'mock',
        clientId: 'N/A',
      },
      staging: {
        type: 'real',
        clientId: process.env.HELSEID_TEST_CLIENT_ID!,
        clientSecret: process.env.HELSEID_TEST_CLIENT_SECRET!,
        issuer: 'https://helseid-sts.test.nhn.no',
      },
      production: {
        type: 'real',
        clientId: process.env.HELSEID_PROD_CLIENT_ID!,
        clientSecret: process.env.HELSEID_PROD_CLIENT_SECRET!,
        issuer: 'https://helseid-sts.nhn.no',
      },
    }[process.env.NODE_ENV!],
  },
};
```

### Environment Guards

**Startup Validation (CRITICAL):**
```typescript
// server/startup.ts
export function validateEnvironment() {
  const env = process.env.NODE_ENV;

  if (!env || !['development', 'staging', 'production'].includes(env)) {
    throw new Error('NODE_ENV must be set to development, staging, or production');
  }

  // CRITICAL: Fail fast if dev features in non-dev
  if (env !== 'development') {
    if (process.env.ENABLE_DEV_SHORTCUTS === 'true') {
      console.error('FATAL: Dev shortcuts cannot be enabled in non-development');
      console.error(`Current NODE_ENV: ${env}`);
      process.exit(1);
    }
  }

  // Verify required env vars per environment
  if (env === 'staging' || env === 'production') {
    const required = [
      'DATABASE_URL',
      'SESSION_SECRET',
      'MASTER_KEY',
      'VIPPS_CLIENT_ID',
      'VIPPS_CLIENT_SECRET',
      'HELSEID_CLIENT_ID',
      'HELSEID_CLIENT_SECRET',
    ];

    for (const key of required) {
      if (!process.env[key]) {
        throw new Error(`${key} required in ${env} environment`);
      }
    }
  }

  logger.info({
    nodeEnv: env,
    issuer: config.issuer,
    devShortcuts: config.features.devShortcuts,
    mockIdPs: config.features.mockIdPs,
  }, 'Environment validated');
}

// Call before server starts
validateEnvironment();
```

## Environment Deployment Strategy

### Development (Local)

**Who Uses:** Developers on their machines

**Characteristics:**
- Runs on `http://localhost:3200`
- Uses local PostgreSQL or SQLite
- Mock IdPs (no external dependencies)
- Dev shortcuts enabled (ADR 0018)
- Relaxed security (HTTP allowed, lenient CORS)
- Fast feedback loop (no production overhead)

**Setup:**
```bash
cd apps/idem-idp
cp .env.example .env.development
pnpm install
pnpm db:migrate
pnpm dev:seed  # Create test accounts
pnpm dev  # Start with hot reload
```

### Staging

**Who Uses:** QA, developers testing integration

**Characteristics:**
- Deployed to `https://auth-staging.eventuras.com`
- Separate PostgreSQL database
- Real IdP test environments (Vipps Test, HelseID Test)
- Production-like security (HTTPS, strict CORS)
- No dev shortcuts
- Used for pre-production validation

**Setup:**
```bash
# Deploy via CI/CD
NODE_ENV=staging pnpm build
NODE_ENV=staging pnpm start

# Or via Docker
docker build -t idem:staging --build-arg NODE_ENV=staging .
docker run -p 3200:3200 --env-file .env.staging idem:staging
```

### Production

**Who Uses:** Eventuras users (end users)

**Characteristics:**
- Deployed to `https://auth.eventuras.com`
- Production PostgreSQL (with backups)
- Real Vipps Prod + HelseID Prod
- Maximum security (KMS for keys, strict rate limits)
- 24/7 monitoring and alerting
- On-call rotation for incidents

**Setup:**
```bash
# Deploy via CI/CD (automated)
NODE_ENV=production pnpm build
NODE_ENV=production pnpm start

# Or Kubernetes
kubectl apply -f k8s/production/
```

## Consequences

### Positive
- **Clear Separation**: No confusion about which environment you're in
- **Fast Development**: Local dev with mock IdPs is fast and offline-capable
- **Realistic Staging**: Staging tests against real IdP test environments
- **Production Safety**: Production never has dev features
- **Easy Reasoning**: Simple mental model (3 separate deployments)

### Negative
- **More Infrastructure**: 3x servers, databases, monitoring
- **More Configuration**: Environment-specific config for each deployment
- **Coordination**: Developers need access to all 3 environments
- **Cost**: Running 3 separate environments (mitigated: dev is local, staging can be smaller)

### Risks and Mitigations

**Risk: Developer accidentally deploys dev build to staging/prod**
- **Mitigation**: CI/CD pipeline validates NODE_ENV before deployment
- **Mitigation**: Startup validation fails if dev features enabled
- **Mitigation**: Integration tests verify prod builds reject dev routes

**Risk: Staging and prod config drift**
- **Mitigation**: Use same codebase, only env vars differ
- **Mitigation**: Infrastructure as Code (Terraform, Kubernetes)
- **Mitigation**: Automated smoke tests after deployment

**Risk: Staging tests pass but production fails (env-specific bugs)**
- **Mitigation**: Staging uses production-like settings (HTTPS, strict security)
- **Mitigation**: Canary deployments in production
- **Mitigation**: Monitor production metrics closely after deployment

## Testing Strategy

### Automated Tests
```typescript
describe('Environment Validation', () => {
  it('should fail if NODE_ENV not set', () => {
    delete process.env.NODE_ENV;
    expect(() => validateEnvironment()).toThrow('NODE_ENV must be set');
  });

  it('should fail if dev shortcuts enabled in staging', () => {
    process.env.NODE_ENV = 'staging';
    process.env.ENABLE_DEV_SHORTCUTS = 'true';
    expect(() => validateEnvironment()).toThrow('FATAL');
  });

  it('should set correct issuer per environment', () => {
    process.env.NODE_ENV = 'development';
    expect(config.issuer).toBe('http://localhost:3200');

    process.env.NODE_ENV = 'staging';
    expect(config.issuer).toBe('https://auth-staging.eventuras.com');

    process.env.NODE_ENV = 'production';
    expect(config.issuer).toBe('https://auth.eventuras.com');
  });

  it('should enable dev features only in development', () => {
    process.env.NODE_ENV = 'development';
    expect(config.features.devShortcuts).toBe(true);

    process.env.NODE_ENV = 'staging';
    expect(config.features.devShortcuts).toBe(false);

    process.env.NODE_ENV = 'production';
    expect(config.features.devShortcuts).toBe(false);
  });
});
```

### Manual Verification
Before each deployment:
- [ ] Verify NODE_ENV set correctly
- [ ] Verify issuer URL matches environment
- [ ] Verify IdP config matches environment (mock vs test vs prod)
- [ ] Verify dev routes return 404 in staging/prod
- [ ] Test HTTPS redirect in staging/prod
- [ ] Verify environment banner shows correct env

## References
- ADR 0003: Development Shortcuts
- ADR 0010: Dev-only Features and Mock IdP
- ADR 0012: Deployment Model
- ADR 0014: Security Hardening Baseline
