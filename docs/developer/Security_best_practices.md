# Security Best Practices

This document outlines security best practices for developing and deploying the Eventuras platform.

## Table of Contents

- [Authentication & Authorization](#authentication--authorization)
- [Data Protection](#data-protection)
- [API Security](#api-security)
- [Frontend Security](#frontend-security)
- [Secret Management](#secret-management)
- [Database Security](#database-security)
- [Dependency Management](#dependency-management)
- [Security Checklist](#security-checklist)

## Authentication & Authorization

### OAuth 2.0 / OpenID Connect

Eventuras uses Auth0 for authentication, following OAuth 2.0 and OpenID Connect standards.

#### Configuration

**Backend (appsettings.json):**
```json
{
  "Auth": {
    "Issuer": "https://your-tenant.auth0.com/",
    "Audience": "https://api.eventuras.yourdomain.com"
  }
}
```

**Frontend (.env):**
```env
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_CLIENT_ID=your_client_id
AUTH0_CLIENT_SECRET=your_client_secret
AUTH0_API_AUDIENCE=https://api.eventuras.yourdomain.com
NEXTAUTH_SECRET=generate_a_random_secret
```

#### Generating Secure Secrets

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Or using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### JWT Token Security

#### Token Storage

**✅ Secure Approaches:**
- Store tokens in HTTP-only cookies (prevents XSS attacks)
- Use secure, SameSite cookies
- Short-lived access tokens (15 minutes)
- Long-lived refresh tokens in secure storage

**❌ Avoid:**
- Storing tokens in localStorage (vulnerable to XSS)
- Storing tokens in sessionStorage
- Long-lived access tokens (> 1 hour)

#### Token Validation

Backend API validates all tokens:

```csharp
services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = Configuration["Auth:Issuer"];
        options.Audience = Configuration["Auth:Audience"];
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ClockSkew = TimeSpan.Zero // No tolerance for expired tokens
        };
    });
```

### Role-Based Access Control (RBAC)

#### Define Roles Clearly

```csharp
public static class Roles
{
    public const string SystemAdmin = "SystemAdmin";
    public const string Admin = "Admin";
    public const string EventManager = "EventManager";
    public const string User = "User";
}
```

#### Protect Endpoints

```csharp
[Authorize(Roles = Roles.Admin)]
[HttpPost("events")]
public async Task<IActionResult> CreateEvent([FromBody] EventDto eventDto)
{
    // Only admins can create events
}

[Authorize]
[HttpGet("events/{id}/registrations")]
public async Task<IActionResult> GetRegistrations(int id)
{
    // Check if user has access to this specific event
    var hasAccess = await _authService.UserCanAccessEvent(User, id);
    if (!hasAccess)
        return Forbid();
    
    // Return registrations
}
```

#### Implement Organization Isolation

```csharp
public class OrganizationFilter : IAsyncActionFilter
{
    public async Task OnActionExecutionAsync(
        ActionExecutingContext context,
        ActionExecutionDelegate next)
    {
        var organizationId = context.HttpContext.User
            .FindFirst("organization_id")?.Value;
        
        if (string.IsNullOrEmpty(organizationId))
        {
            context.Result = new ForbidResult();
            return;
        }
        
        // Set organization context
        context.HttpContext.Items["OrganizationId"] = organizationId;
        await next();
    }
}
```

## Data Protection

### Encryption at Rest

#### Database Encryption

**PostgreSQL Transparent Data Encryption:**
```sql
-- Enable encryption for sensitive columns
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Encrypt sensitive data
INSERT INTO users (email, encrypted_ssn) 
VALUES (
    'user@example.com',
    pgp_sym_encrypt('123-45-6789', 'encryption-key')
);

-- Decrypt when needed
SELECT email, pgp_sym_decrypt(encrypted_ssn, 'encryption-key') as ssn
FROM users;
```

**Or use application-level encryption:**

```csharp
public class EncryptionService
{
    private readonly string _encryptionKey;
    
    public string Encrypt(string plaintext)
    {
        using var aes = Aes.Create();
        aes.Key = Convert.FromBase64String(_encryptionKey);
        aes.GenerateIV();
        
        var encryptor = aes.CreateEncryptor(aes.Key, aes.IV);
        var plaintextBytes = Encoding.UTF8.GetBytes(plaintext);
        var cipherBytes = encryptor.TransformFinalBlock(plaintextBytes, 0, plaintextBytes.Length);
        
        var result = new byte[aes.IV.Length + cipherBytes.Length];
        Buffer.BlockCopy(aes.IV, 0, result, 0, aes.IV.Length);
        Buffer.BlockCopy(cipherBytes, 0, result, aes.IV.Length, cipherBytes.Length);
        
        return Convert.ToBase64String(result);
    }
    
    public string Decrypt(string ciphertext)
    {
        var fullCipher = Convert.FromBase64String(ciphertext);
        using var aes = Aes.Create();
        aes.Key = Convert.FromBase64String(_encryptionKey);
        
        var iv = new byte[aes.IV.Length];
        var cipher = new byte[fullCipher.Length - iv.Length];
        
        Buffer.BlockCopy(fullCipher, 0, iv, 0, iv.Length);
        Buffer.BlockCopy(fullCipher, iv.Length, cipher, 0, cipher.Length);
        
        aes.IV = iv;
        var decryptor = aes.CreateDecryptor(aes.Key, aes.IV);
        var plainBytes = decryptor.TransformFinalBlock(cipher, 0, cipher.Length);
        
        return Encoding.UTF8.GetString(plainBytes);
    }
}
```

### Encryption in Transit

**✅ Always use HTTPS/TLS:**

```csharp
// Force HTTPS in production
app.UseHttpsRedirection();

// Configure HSTS
app.UseHsts();

// In Startup.cs
services.AddHsts(options =>
{
    options.MaxAge = TimeSpan.FromDays(365);
    options.IncludeSubDomains = true;
    options.Preload = true;
});
```

**Frontend configuration:**
```typescript
// Next.js - next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload'
          }
        ]
      }
    ];
  }
};
```

### Personal Data Protection (GDPR)

#### Data Minimization

```csharp
// ❌ Bad - Collecting unnecessary data
public class RegistrationDto
{
    public string Email { get; set; }
    public string Phone { get; set; }
    public string SSN { get; set; }  // Not needed!
    public string HomeAddress { get; set; }  // Not needed!
}

// ✅ Good - Only collect what's necessary
public class RegistrationDto
{
    public string Email { get; set; }
    public string Phone { get; set; }  // Only if SMS notifications needed
}
```

#### Data Retention

```csharp
public class DataRetentionService
{
    public async Task DeleteOldDataAsync()
    {
        var cutoffDate = DateTime.UtcNow.AddYears(-2);
        
        // Delete old registrations
        await _context.Registrations
            .Where(r => r.CreatedAt < cutoffDate)
            .ExecuteDeleteAsync();
        
        // Anonymize user data
        await _context.Users
            .Where(u => u.LastLoginAt < cutoffDate && u.IsDeleted)
            .ExecuteUpdateAsync(u => u
                .SetProperty(p => p.Email, "deleted@eventuras.com")
                .SetProperty(p => p.Phone, null)
            );
    }
}
```

#### Right to be Forgotten

```csharp
[HttpDelete("users/{id}/gdpr")]
[Authorize]
public async Task<IActionResult> DeleteUserData(string id)
{
    // Verify user can delete their own data
    if (User.FindFirst("sub")?.Value != id)
        return Forbid();
    
    await _userService.DeleteUserDataAsync(id);
    return NoContent();
}
```

## API Security

### Input Validation

**Always validate and sanitize user input:**

```csharp
public class CreateEventDto
{
    [Required]
    [StringLength(200, MinimumLength = 3)]
    public string Title { get; set; }
    
    [Required]
    [EmailAddress]
    public string ContactEmail { get; set; }
    
    [Url]
    public string Website { get; set; }
    
    [Range(1, 10000)]
    public int MaxParticipants { get; set; }
}

// In controller
[HttpPost("events")]
public async Task<IActionResult> CreateEvent([FromBody] CreateEventDto dto)
{
    if (!ModelState.IsValid)
        return BadRequest(ModelState);
    
    // Additional validation
    if (dto.MaxParticipants < 0)
        return BadRequest("Max participants must be positive");
    
    // Process...
}
```

### SQL Injection Prevention

**✅ Always use parameterized queries:**

```csharp
// ✅ Good - Parameterized query
var events = await _context.Events
    .Where(e => e.Title.Contains(searchTerm))
    .ToListAsync();

// ✅ Good - Raw SQL with parameters
var events = await _context.Events
    .FromSqlRaw("SELECT * FROM Events WHERE Title LIKE {0}", $"%{searchTerm}%")
    .ToListAsync();

// ❌ Bad - String concatenation (SQL injection risk!)
var sql = $"SELECT * FROM Events WHERE Title LIKE '%{searchTerm}%'";
var events = await _context.Events.FromSqlRaw(sql).ToListAsync();
```

### CORS Configuration

**Restrict allowed origins:**

```csharp
services.AddCors(options =>
{
    options.AddPolicy("Production", builder =>
    {
        builder
            .WithOrigins(
                "https://www.eventuras.com",
                "https://admin.eventuras.com"
            )
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    });
});

// In production
app.UseCors("Production");
```

### Rate Limiting

**Protect against abuse:**

```csharp
services.AddRateLimiter(options =>
{
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(context =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: context.User.Identity?.Name ?? context.Request.Headers.Host.ToString(),
            factory: partition => new FixedWindowRateLimiterOptions
            {
                AutoReplenishment = true,
                PermitLimit = 100,
                QueueLimit = 0,
                Window = TimeSpan.FromMinutes(1)
            }));
});

app.UseRateLimiter();
```

### Content Security Policy (CSP)

```csharp
app.Use(async (context, next) =>
{
    context.Response.Headers.Add("Content-Security-Policy",
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; " +
        "style-src 'self' 'unsafe-inline'; " +
        "img-src 'self' data: https:; " +
        "font-src 'self' data:; " +
        "connect-src 'self' https://api.eventuras.com; " +
        "frame-ancestors 'none';");
    
    await next();
});
```

## Frontend Security

### XSS Prevention

**React automatically escapes values, but be careful with:**

```typescript
// ❌ Dangerous - Can execute scripts
function DangerousComponent({ html }) {
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

// ✅ Safe - Use a sanitizer
import DOMPurify from 'dompurify';

function SafeComponent({ html }) {
  const cleanHtml = DOMPurify.sanitize(html);
  return <div dangerouslySetInnerHTML={{ __html: cleanHtml }} />;
}

// ✅ Better - Use markdown or plain text
function BetterComponent({ markdown }) {
  return <Markdown>{markdown}</Markdown>;
}
```

### CSRF Protection

**Next.js with next-auth handles CSRF automatically:**

```typescript
// CSRF tokens are automatically included in forms
export default function Form() {
  return (
    <form method="post" action="/api/submit">
      <input type="text" name="data" />
      <button type="submit">Submit</button>
    </form>
  );
}
```

### Secure Headers

```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ]
      }
    ];
  }
};
```

### Client-Side Validation

**Never trust client-side validation alone:**

```typescript
// Frontend validation for UX
function RegistrationForm() {
  const handleSubmit = (data) => {
    // Client-side validation
    if (!data.email || !isValidEmail(data.email)) {
      setError('Invalid email');
      return;
    }
    
    // API call - Backend will validate again!
    api.register(data);
  };
}
```

## Secret Management

### Never Commit Secrets

**❌ Never do this:**
```javascript
const API_KEY = "sk_live_abc123def456"; // WRONG!
```

**✅ Use environment variables:**
```javascript
const API_KEY = process.env.API_KEY;
```

### .gitignore

Ensure sensitive files are ignored:

```gitignore
# Environment files
.env
.env.local
.env.production
.env.*.local

# User secrets
appsettings.Development.json
secrets.json

# Certificates
*.pfx
*.key
*.pem
```

### Development Secrets

**Backend (.NET):**
```bash
# Use User Secrets for development
cd apps/api/src/Eventuras.WebApi
dotnet user-secrets set "Stripe:SecretKey" "sk_test_..."
dotnet user-secrets set "SendGrid:ApiKey" "SG...."
```

**Frontend:**
```bash
# Use .env.local (already in .gitignore)
echo "API_KEY=your_key" >> .env.local
```

### Production Secrets

**Azure Key Vault:**
```csharp
builder.Configuration.AddAzureKeyVault(
    new Uri($"https://{keyVaultName}.vault.azure.net/"),
    new DefaultAzureCredential());
```

**Environment Variables:**
```bash
# Set in hosting platform (Vercel, Azure, etc.)
STRIPE_SECRET_KEY=sk_live_...
SENDGRID_API_KEY=SG....
```

## Database Security

### Connection String Security

**❌ Bad:**
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=prod-db.com;Database=eventuras;Username=admin;Password=password123"
  }
}
```

**✅ Good:**
```csharp
// Use environment variables
var connectionString = Environment.GetEnvironmentVariable("DATABASE_URL");

// Or Azure Key Vault
var connectionString = Configuration["ConnectionStrings:DefaultConnection"];
```

### Least Privilege Principle

```sql
-- Create application user with limited privileges
CREATE USER eventuras_app WITH PASSWORD 'secure_password';

-- Grant only necessary permissions
GRANT CONNECT ON DATABASE eventuras TO eventuras_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO eventuras_app;

-- Revoke dangerous permissions
REVOKE CREATE ON SCHEMA public FROM eventuras_app;
REVOKE DROP ON ALL TABLES IN SCHEMA public FROM eventuras_app;
```

### Backup & Recovery

```bash
# Automated daily backups
pg_dump -h localhost -U eventuras eventuras > backup_$(date +%Y%m%d).sql

# Encrypt backups
gpg --symmetric --cipher-algo AES256 backup_20240101.sql
```

## Dependency Management

### Regular Updates

```bash
# Check for updates
npm outdated

# Update dependencies
npm update

# For .NET
dotnet list package --outdated
```

### Vulnerability Scanning

```bash
# npm audit
npm audit
npm audit fix

# .NET vulnerability check
dotnet list package --vulnerable
```

### Dependabot Configuration

`.github/dependabot.yml`:
```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10

  - package-ecosystem: "nuget"
    directory: "/apps/api"
    schedule:
      interval: "weekly"
```

## Security Checklist

### Development

- [ ] All secrets in environment variables, never in code
- [ ] Input validation on all endpoints
- [ ] Parameterized queries for database access
- [ ] HTTPS enforced everywhere
- [ ] Authentication required for protected routes
- [ ] Role-based authorization implemented
- [ ] XSS protection (sanitize HTML input)
- [ ] CSRF protection enabled
- [ ] Rate limiting on public endpoints
- [ ] Dependency vulnerability scanning enabled

### Deployment

- [ ] HTTPS/TLS certificates valid
- [ ] Security headers configured (CSP, HSTS, etc.)
- [ ] CORS restricted to known origins
- [ ] Database credentials rotated
- [ ] Secrets stored in secure vault (Azure Key Vault, etc.)
- [ ] Database backups encrypted and tested
- [ ] Error messages don't leak sensitive info
- [ ] Logging doesn't include sensitive data
- [ ] Rate limiting configured
- [ ] DDoS protection enabled

### Code Review

- [ ] No hardcoded secrets
- [ ] No SQL injection vulnerabilities
- [ ] Input validation present
- [ ] Authentication/authorization checks
- [ ] Error handling doesn't expose internals
- [ ] Dependencies up to date
- [ ] Security headers implemented

## Incident Response

### Security Incident Procedure

1. **Detect & Contain**
   - Monitor error logs and security alerts
   - Isolate affected systems if needed

2. **Assess Impact**
   - Determine what data was accessed
   - Identify affected users

3. **Remediate**
   - Fix vulnerability
   - Rotate compromised credentials
   - Deploy patch

4. **Notify**
   - Inform affected users (if personal data breach)
   - Comply with GDPR notification requirements (72 hours)

5. **Post-Mortem**
   - Document incident
   - Improve security measures
   - Update procedures

### Contact

For security issues, contact: security@eventuras.com

## Further Reading

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [Auth0 Security Best Practices](https://auth0.com/docs/secure)
- [ASP.NET Core Security](https://docs.microsoft.com/en-us/aspnet/core/security/)
- [Next.js Security](https://nextjs.org/docs/advanced-features/security-headers)
