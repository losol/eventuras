# ADR 0010 — Dev-only Features and Mock IdP

## Status
Accepted

## Context
Developers need fast feedback loops without depending on real upstream IdPs.
However, development features accidentally enabled in production pose severe security risks.

## Decision

### Mock IdP Provider
- Provide a mock upstream provider (e.g. `vipps_mock`) in the same broker model.
- Mock IdP registration is guarded by `IDEM_ENV === "development"`.
- Mock IdP allows testing full OIDC flows locally without external dependencies.

### Dev-only Routes
- Dev-only routes live under `/__dev/*` prefix
- Routes return 404 in non-development environments (no route leakage)
- Routes include: seed data, reset database, mock user creation, token inspection

### Environment Guards

**Startup Validation (CRITICAL):**
```typescript
// server/startup.ts
export function validateEnvironment() {
  const env = process.env.NODE_ENV;
  const idemEnv = process.env.IDEM_ENV;
  
  // FAIL FAST: Prevent dev features in production
  if (env === 'production') {
    if (idemEnv === 'development') {
      console.error('FATAL: IDEM_ENV cannot be "development" in production');
      process.exit(1);
    }
    
    if (process.env.ENABLE_DEV_ROUTES === 'true') {
      console.error('FATAL: Dev routes must not be enabled in production');
      process.exit(1);
    }
    
    if (process.env.ENABLE_MOCK_IDP === 'true') {
      console.error('FATAL: Mock IdP must not be enabled in production');
      process.exit(1);
    }
  }
  
  // Log startup configuration
  logger.info({ 
    nodeEnv: env, 
    idemEnv,
    devRoutesEnabled: process.env.ENABLE_DEV_ROUTES === 'true',
    mockIdPEnabled: process.env.ENABLE_MOCK_IDP === 'true'
  }, 'Environment validated successfully');
}

// Must be called before server starts
validateEnvironment();
```

**Runtime Guards:**
```typescript
// middleware/dev-only.ts
export function requireDevelopment(req, res, next) {
  if (process.env.NODE_ENV !== 'development') {
    // Return 404, don't leak route existence
    return res.status(404).end();
  }
  next();
}

// routes/dev.ts
app.use('/__dev', requireDevelopment, devRoutes);
```

**Mock IdP Registration:**
```typescript
// idp/registry.ts
export function registerProviders() {
  const providers = loadUpstreamProviders();
  
  // Only register mock IdP in development
  if (process.env.IDEM_ENV === 'development' && 
      process.env.ENABLE_MOCK_IDP === 'true') {
    providers.push({
      key: 'vipps_mock',
      display_name: 'Vipps (Mock)',
      type: 'mock',
      // ... mock configuration
    });
    
    logger.warn('Mock IdP registered - DEV ONLY');
  }
  
  return providers;
}
```

### Visual Indicators
Development environment shows clear visual warnings:
- Red banner: "DEVELOPMENT ENVIRONMENT - MOCK IDP ENABLED"
- Browser tab title prefix: "[DEV]"
- Different favicon color

## Consequences

### Positive
- High developer productivity with fast feedback loops
- No external dependencies for local development
- Clear visual distinction between environments
- Fail-fast approach prevents configuration mistakes

### Negative
- Additional code complexity for environment guards
- Must maintain mock IdP implementation alongside real integrations
- Developers must be aware of environment variable requirements

### Risks and Mitigations
- **Risk:** Mock IdP accidentally enabled in production
  - **Mitigation:** Startup validation fails fast (process.exit)
  - **Mitigation:** Integration tests verify production config rejects dev features
  - **Mitigation:** Deployment pipeline checks environment variables
- **Risk:** Dev routes discoverable in production (security through obscurity)
  - **Mitigation:** Routes return 404 (no route leakage)
  - **Mitigation:** No middleware is even registered for dev routes in production
- **Risk:** Developers bypass guards for "quick testing"
  - **Mitigation:** Code review checklist requires guard validation
  - **Mitigation:** Linter rules detect dev-only code in production paths

## Testing Strategy

### Automated Tests
```typescript
describe('Dev-only features', () => {
  it('should fail startup if dev features enabled in production', () => {
    process.env.NODE_ENV = 'production';
    process.env.IDEM_ENV = 'development';
    
    expect(() => validateEnvironment()).toThrow('FATAL');
  });
  
  it('should return 404 for /__dev routes in production', async () => {
    process.env.NODE_ENV = 'production';
    const res = await request(app).get('/__dev/seed');
    expect(res.status).toBe(404);
  });
  
  it('should not register mock IdP in production', () => {
    process.env.NODE_ENV = 'production';
    const providers = registerProviders();
    expect(providers.find(p => p.key === 'vipps_mock')).toBeUndefined();
  });
});
```

### Manual Verification
Before each production deployment:
- [ ] Verify startup logs show production environment
- [ ] Verify mock IdP is not in provider list
- [ ] Verify `/__dev/*` routes return 404
- [ ] Verify no development banner visible

## References
- Security hardening baseline: ADR 0014
- Environment model: ADR 0002
