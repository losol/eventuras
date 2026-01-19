# ADR 0014 — Security Hardening Baseline

## Status
Accepted

## Context
As an identity platform, Idem is a high-value target for attacks:
- Credential stuffing and brute force attempts
- Token theft and replay attacks
- Clickjacking and phishing
- DDoS and resource exhaustion
- XSS and injection attacks

A comprehensive security baseline must be in place from day 1, not added retroactively.

## Decision

### 1. Rate Limiting
Implement aggressive rate limiting on authentication endpoints to prevent brute force.

**Configuration:**
```typescript
import rateLimit from 'express-rate-limit';

// Token endpoint (most critical)
const tokenLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests, please try again later',
});

// Authorization endpoint
const authorizeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200, // higher limit for redirects
});

// Login attempts (stricter)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // only 5 login attempts per 15 min
  skipSuccessfulRequests: true, // only count failures
});

app.use('/token', tokenLimiter);
app.use('/authorize', authorizeLimiter);
app.use('/interaction/login', loginLimiter);
```

**Phase 2 Enhancement:** Replace in-memory rate limiting with Redis-backed solution for multi-instance deployments.

### 2. Security Headers
Use Helmet.js to set essential security headers.

```typescript
import helmet from 'helmet';

app.use(helmet({
  // Prevent clickjacking
  xFrameOptions: { action: 'deny' },
  
  // Prevent MIME sniffing
  contentTypeOptions: true,
  
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      frameAncestors: ["'none'"], // Extra clickjacking protection
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"], // Only for Next.js
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  
  // HSTS (enforce HTTPS)
  strictTransportSecurity: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
  
  // Referrer policy
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
}));
```

### 3. HTTPS Enforcement
**Production:** Enforce HTTPS at all layers
```typescript
// Redirect HTTP to HTTPS
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && !req.secure) {
    return res.redirect(301, `https://${req.headers.host}${req.url}`);
  }
  next();
});
```

**Development:** Allow HTTP for localhost only

### 4. CORS Configuration
Restrict CORS to known origins only.

```typescript
import cors from 'cors';

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];

app.use(cors({
  origin: (origin, callback) => {
    // Allow same-origin (no origin header)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

### 5. Input Validation
Use Zod for all API inputs - never trust client data.

```typescript
import { z } from 'zod';

const LoginSchema = z.object({
  username: z.string().min(1).max(255).email(),
  password: z.string().min(8).max(128),
  tenant_id: z.string().uuid(),
});

app.post('/login', async (req, res) => {
  const result = LoginSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }
  // Use validated data
  const { username, password, tenant_id } = result.data;
});
```

### 6. CSRF Protection
Use Next.js built-in CSRF protection for admin forms.

```typescript
// next.config.js
module.exports = {
  experimental: {
    csrf: true, // Enable CSRF protection
  },
};
```

For custom forms, use csrf tokens:
```typescript
import { getCsrfToken } from 'next-auth/react';

<input type="hidden" name="csrfToken" value={await getCsrfToken()} />
```

### 7. Environment Guards
Fail fast if development features are enabled in production.

```typescript
// server/startup.ts
export function validateEnvironment() {
  const env = process.env.NODE_ENV;
  const idemEnv = process.env.IDEM_ENV;
  
  // CRITICAL: Prevent dev features in production
  if (env === 'production') {
    if (idemEnv === 'development') {
      throw new Error('FATAL: IDEM_ENV cannot be "development" in production');
    }
    
    if (process.env.ENABLE_DEV_ROUTES === 'true') {
      throw new Error('FATAL: Dev routes must not be enabled in production');
    }
    
    if (!process.env.MASTER_KEY) {
      throw new Error('FATAL: MASTER_KEY must be set in production');
    }
  }
  
  // Log environment on startup
  logger.info({ 
    nodeEnv: env, 
    idemEnv,
    devRoutesEnabled: process.env.ENABLE_DEV_ROUTES === 'true'
  }, 'Environment validated');
}

// Call at server startup
validateEnvironment();
```

### 8. Cookie Security
Configure cookies with secure flags.

```typescript
// Session cookies
app.use(session({
  secret: process.env.SESSION_SECRET!,
  cookie: {
    httpOnly: true, // Prevent XSS
    secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
    sameSite: 'lax', // CSRF protection
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
  name: 'idem.sid', // Don't use default name
}));
```

### 9. Logging Hygiene
Never log secrets, tokens, or sensitive PII.

```typescript
// logger/sanitizer.ts
const SENSITIVE_FIELDS = [
  'password',
  'client_secret',
  'access_token',
  'refresh_token',
  'id_token',
  'private_jwk',
  'authorization',
  'cookie',
];

export function sanitize(obj: any): any {
  if (typeof obj !== 'object' || obj === null) return obj;
  
  const sanitized = Array.isArray(obj) ? [] : {};
  
  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    
    if (SENSITIVE_FIELDS.some(field => lowerKey.includes(field))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object') {
      sanitized[key] = sanitize(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

// Usage
logger.info(sanitize({ username: 'user', password: 'secret' }));
// Output: { username: 'user', password: '[REDACTED]' }
```

## Consequences

### Positive
- Comprehensive protection against common attacks
- Clear security baseline for code review
- Fail-fast approach prevents configuration mistakes
- Logging hygiene prevents accidental secret leakage

### Negative
- Rate limiting may impact legitimate users (false positives)
- Additional middleware adds minimal latency (~1-2ms)
- Stricter CORS may complicate local development

### Risks and Mitigations
- **Risk:** Rate limiting blocks legitimate traffic during peak usage
  - **Mitigation:** Monitor rate limit hits, adjust thresholds based on real data, implement allowlists for trusted IPs
- **Risk:** CSP breaks legitimate functionality
  - **Mitigation:** Test thoroughly, use CSP report-only mode first, document exceptions
- **Risk:** HTTPS redirect loops in misconfigured proxies
  - **Mitigation:** Trust proxy headers, document reverse proxy configuration

## Testing Strategy

### Security Testing Checklist
- [ ] Rate limiting: Verify limits are enforced (automated test)
- [ ] HTTPS redirect: Test HTTP requests redirect to HTTPS
- [ ] Security headers: Verify all headers present (automated test)
- [ ] CORS: Test cross-origin requests blocked
- [ ] Input validation: Fuzz test API endpoints
- [ ] Cookie flags: Verify httpOnly, secure, sameSite set
- [ ] Environment guards: Test startup fails with invalid config
- [ ] Logging: Verify secrets are redacted (automated test)

### Penetration Testing
Before production launch:
- External security audit
- OWASP Top 10 coverage
- OAuth/OIDC specific attacks (token theft, redirect manipulation)

## References
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [Helmet.js Documentation](https://helmetjs.github.io/)
- [Express Rate Limit](https://express-rate-limit.mintlify.app/)
- [OAuth 2.0 Security Best Current Practice](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics)
