# Troubleshooting Guide

Common issues and solutions when working with Eventuras.

## Table of Contents

- [Development Environment](#development-environment)
- [Backend Issues](#backend-issues)
- [Frontend Issues](#frontend-issues)
- [Database Issues](#database-issues)
- [Authentication Issues](#authentication-issues)
- [Build & Deployment Issues](#build--deployment-issues)
- [Testing Issues](#testing-issues)
- [Performance Issues](#performance-issues)

## Development Environment

### Node.js Version Issues

**Error:** `The engine "node" is incompatible with this module`

**Solution:**
```bash
# Check your Node.js version
node --version

# Install correct version (20+)
nvm install 20
nvm use 20

# Or using n
n 20
```

### npm Install Fails

**Error:** `ERESOLVE unable to resolve dependency tree`

**Solution:**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Or force install (use with caution)
npm install --legacy-peer-deps

# Clear npm cache
npm cache clean --force
npm install
```

### Husky Hooks Not Working

**Error:** `husky - pre-commit hook exited with code 1`

**Solution:**
```bash
# Reinstall Husky
npm run prepare

# Make hooks executable
chmod +x .husky/*

# Verify hooks are installed
ls -la .husky
```

## Backend Issues

### Database Connection Failed

**Error:** `Npgsql.NpgsqlException: Failed to connect to localhost:5432`

**Diagnosis:**
```bash
# Check if PostgreSQL is running
docker ps | grep postgres
# or
pg_isready -h localhost -p 5432

# Check connection from command line
psql -h localhost -U eventuras -d eventuras
```

**Solutions:**

1. **Start PostgreSQL:**
```bash
# Using Docker
docker-compose up -d postgres

# Or start local PostgreSQL
sudo service postgresql start
```

2. **Verify credentials:**
```json
// appsettings.Development.json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=eventuras;Username=eventuras;Password=Str0ng!PaSsw0rd"
  }
}
```

3. **Check firewall:**
```bash
# Allow PostgreSQL port
sudo ufw allow 5432
```

### Migration Errors

**Error:** `The specified deps.json does not exist`

**Solution:**
```bash
# Build first, then migrate
cd apps/api
dotnet build
dotnet ef database update --project src/Eventuras.WebApi
```

**Error:** `A migration with the name 'XXX' already exists`

**Solution:**
```bash
# Remove the duplicate migration
dotnet ef migrations remove --project src/Eventuras.WebApi

# Or create with a different name
dotnet ef migrations add NewMigrationName --project src/Eventuras.WebApi
```

**Error:** `Migration applied but tables not created`

**Solution:**
```bash
# Drop and recreate database
dotnet ef database drop --project src/Eventuras.WebApi
dotnet ef database update --project src/Eventuras.WebApi

# Or manually verify
psql -U eventuras -d eventuras -c "\dt"
```

### API Returns 401 Unauthorized

**Error:** API requests return 401 even with valid token

**Diagnosis:**
```bash
# Check token
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/v3/events

# Decode JWT token at https://jwt.io to verify claims
```

**Solutions:**

1. **Verify Auth0 configuration:**
```json
// appsettings.json
{
  "Auth": {
    "Issuer": "https://your-tenant.auth0.com/",
    "Audience": "https://api.eventuras.yourdomain.com"
  }
}
```

2. **Check token expiration:**
```csharp
// Temporarily log token validation
services.AddAuthentication()
    .AddJwtBearer(options =>
    {
        options.Events = new JwtBearerEvents
        {
            OnAuthenticationFailed = context =>
            {
                Console.WriteLine($"Auth failed: {context.Exception}");
                return Task.CompletedTask;
            }
        };
    });
```

### Swagger UI Not Accessible

**Error:** `404 Not Found` when accessing `/swagger`

**Solution:**

1. **Verify environment:**
```bash
# Swagger only available in Development
export ASPNETCORE_ENVIRONMENT=Development
dotnet run --project src/Eventuras.WebApi
```

2. **Check configuration:**
```csharp
// Program.cs should have
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
```

### Slow API Response

**Diagnosis:**
```bash
# Enable detailed logging
export ASPNETCORE_LOGGING__LOGLEVEL__DEFAULT=Debug
dotnet run --project src/Eventuras.WebApi
```

**Common Causes:**

1. **N+1 Query Problem:**
```csharp
// ❌ Bad - Causes N+1 queries
var events = await _context.Events.ToListAsync();
foreach (var evt in events)
{
    var registrations = await _context.Registrations
        .Where(r => r.EventId == evt.Id)
        .ToListAsync();
}

// ✅ Good - Use Include
var events = await _context.Events
    .Include(e => e.Registrations)
    .ToListAsync();
```

2. **Missing indexes:**
```sql
-- Add index on frequently queried columns
CREATE INDEX idx_events_date ON events(start_date);
CREATE INDEX idx_registrations_user ON registrations(user_id);
```

## Frontend Issues

### Next.js Build Fails

**Error:** `Module not found: Can't resolve '@eventuras/sdk'`

**Solution:**
```bash
# Rebuild all packages
npm run build

# Or build specific package
npm run build --workspace=libs/sdk

# Clear Next.js cache
rm -rf apps/web/.next
npm run build --workspace=apps/web
```

### Environment Variables Not Loading

**Error:** `process.env.NEXT_PUBLIC_API_URL is undefined`

**Solutions:**

1. **Check file name:**
```bash
# Should be .env.local, not .env
ls -la apps/web/.env*
```

2. **Verify variable prefix:**
```env
# ✅ Exposed to client
NEXT_PUBLIC_API_URL=http://localhost:5000

# ❌ Server-only (not accessible in browser)
API_URL=http://localhost:5000
```

3. **Restart dev server:**
```bash
# Environment variables are loaded at startup
# Stop server (Ctrl+C) and restart
npm run dev
```

### API Calls Fail with CORS Error

**Error:** `Access to fetch blocked by CORS policy`

**Diagnosis:**
```bash
# Check browser console for full error
# Should show: "Origin 'http://localhost:3000' has been blocked..."
```

**Solutions:**

1. **Backend - Add CORS policy:**
```csharp
// Program.cs
builder.Services.AddCors(options =>
{
    options.AddPolicy("Development", builder =>
    {
        builder
            .WithOrigins("http://localhost:3000")
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    });
});

app.UseCors("Development");
```

2. **Frontend - Use correct API URL:**
```typescript
// Check .env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000

// Not https://localhost:5000 (unless you have SSL locally)
```

### TypeScript Errors

**Error:** `Property 'x' does not exist on type 'Y'`

**Solutions:**

1. **Update type definitions:**
```bash
# Regenerate SDK types from OpenAPI
npm run generate:sdk

# Or manually update types in libs/sdk
```

2. **Check tsconfig.json:**
```json
{
  "compilerOptions": {
    "strict": true,
    "skipLibCheck": false
  }
}
```

3. **Clear TypeScript cache:**
```bash
# Remove build info files
find . -name "*.tsbuildinfo" -delete

# Restart TypeScript server in VS Code
# Cmd/Ctrl + Shift + P > "TypeScript: Restart TS Server"
```

### Storybook Fails to Load

**Error:** `ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL`

**Solution:**
```bash
# Build dependencies first
npm run build --workspace=libs/ratio-ui

# Then start Storybook
npm run storybook --workspace=apps/web
```

## Database Issues

### Tables Not Created

**Error:** Database exists but tables are missing

**Solution:**
```bash
# Run migrations
cd apps/api
dotnet ef database update --project src/Eventuras.WebApi

# Verify tables
psql -U eventuras -d eventuras -c "\dt"
```

### Database Locked

**Error:** `database "eventuras" is being accessed by other users`

**Solution:**
```bash
# Terminate other connections
psql -U postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'eventuras' AND pid <> pg_backend_pid();"

# Then drop/recreate
psql -U postgres -c "DROP DATABASE eventuras;"
psql -U postgres -c "CREATE DATABASE eventuras;"
```

### Seed Data Not Applied

**Error:** Admin user not created

**Solution:**
```bash
# Manually run seed
cd apps/api
dotnet run --project src/Eventuras.WebApi -- --seed

# Or check if seed runs on startup
# Should see log: "Seeding database with admin user..."
```

### Connection Pool Exhausted

**Error:** `System.InvalidOperationException: Timeout expired getting connection from pool`

**Solutions:**

1. **Increase pool size:**
```csharp
"ConnectionStrings": {
  "DefaultConnection": "Host=localhost;Database=eventuras;Username=eventuras;Password=Str0ng!PaSsw0rd;Maximum Pool Size=100"
}
```

2. **Ensure connections are disposed:**
```csharp
// ✅ Good - Using statement
await using var context = new ApplicationDbContext();
var events = await context.Events.ToListAsync();

// ❌ Bad - Connection not disposed
var context = new ApplicationDbContext();
var events = await context.Events.ToListAsync();
```

## Authentication Issues

### Auth0 Configuration Errors

**Error:** `The issuer 'xxx' is invalid`

**Solution:**
```bash
# Verify Auth0 domain includes trailing slash
# ✅ Correct
"Issuer": "https://your-tenant.auth0.com/"

# ❌ Wrong
"Issuer": "https://your-tenant.auth0.com"
```

### Login Redirect Loop

**Error:** User keeps getting redirected between app and Auth0

**Solutions:**

1. **Check callback URL configuration:**
```bash
# In Auth0 dashboard, verify Allowed Callback URLs includes:
http://localhost:3000/api/auth/callback/auth0
https://yourapp.com/api/auth/callback/auth0
```

2. **Verify session configuration:**
```typescript
// pages/api/auth/[...nextauth].ts
export default NextAuth({
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
});
```

### Token Refresh Fails

**Error:** `RefreshAccessTokenError: Refresh token is invalid`

**Solutions:**

1. **Enable offline_access scope:**
```typescript
export default NextAuth({
  providers: [
    Auth0Provider({
      authorization: {
        params: {
          scope: "openid email profile offline_access",
        },
      },
    }),
  ],
});
```

2. **Implement token refresh:**
```typescript
async jwt({ token, account }) {
  if (account) {
    token.accessToken = account.access_token;
    token.refreshToken = account.refresh_token;
    token.expiresAt = Date.now() + account.expires_in * 1000;
  }

  // Refresh token if expired
  if (Date.now() < token.expiresAt) {
    return token;
  }

  return refreshAccessToken(token);
}
```

## Build & Deployment Issues

### Docker Build Fails

**Error:** `ERROR [build 5/8] RUN npm install`

**Solutions:**

1. **Clear Docker cache:**
```bash
docker builder prune
docker-compose build --no-cache
```

2. **Check Dockerfile:**
```dockerfile
# Use correct Node version
FROM node:20-alpine

# Copy package files first
COPY package*.json ./
RUN npm ci --only=production
```

### Vercel Deployment Fails

**Error:** `Build failed: Module not found`

**Solutions:**

1. **Set correct build command:**
```json
// vercel.json
{
  "buildCommand": "npm run build --workspace=apps/web",
  "outputDirectory": "apps/web/.next"
}
```

2. **Set root directory in Vercel:**
```
Root Directory: apps/web
```

3. **Ensure environment variables are set in Vercel dashboard**

### Production Build Size Too Large

**Error:** `Bundle size exceeds recommended limit`

**Solutions:**

1. **Analyze bundle:**
```bash
npm run build --workspace=apps/web -- --analyze
```

2. **Enable code splitting:**
```typescript
// Dynamic imports
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <p>Loading...</p>,
});
```

3. **Remove unused dependencies:**
```bash
# Find unused dependencies
npx depcheck apps/web
```

## Testing Issues

### Playwright Tests Fail

**Error:** `browserType.launch: Executable doesn't exist`

**Solution:**
```bash
# Install browsers
npx playwright install

# Or with dependencies
npx playwright install --with-deps chromium
```

### Tests Timeout

**Error:** `Test timeout of 30000ms exceeded`

**Solutions:**

1. **Increase timeout:**
```typescript
// playwright.config.ts
export default defineConfig({
  use: {
    timeout: 60000, // 60 seconds
  },
});
```

2. **Wait for elements properly:**
```typescript
// ❌ Bad - Hard wait
await page.waitForTimeout(5000);

// ✅ Good - Wait for condition
await page.waitForLoadState('networkidle');
await expect(page.getByText('Welcome')).toBeVisible();
```

### E2E Tests Fail in CI

**Error:** Tests pass locally but fail in GitHub Actions

**Solutions:**

1. **Use headed mode locally to debug:**
```bash
npm run test:e2e -- --headed
```

2. **Add CI-specific configuration:**
```typescript
// playwright.config.ts
export default defineConfig({
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
});
```

3. **Check environment variables:**
```yaml
# .github/workflows/test.yml
- name: Run E2E tests
  env:
    BASE_URL: http://localhost:3000
    API_URL: http://localhost:5000
  run: npm run test:e2e
```

## Performance Issues

### Slow Page Load

**Diagnosis:**
```bash
# Use Lighthouse
npm install -g lighthouse
lighthouse http://localhost:3000 --view

# Or use Next.js built-in profiling
npm run dev -- --profile
```

**Solutions:**

1. **Enable image optimization:**
```typescript
import Image from 'next/image';

// ✅ Use Next.js Image component
<Image
  src="/event.jpg"
  alt="Event"
  width={800}
  height={600}
  placeholder="blur"
/>
```

2. **Implement caching:**
```typescript
// app/events/page.tsx
export const revalidate = 60; // Revalidate every 60 seconds

export default async function EventsPage() {
  const events = await fetchEvents();
  return <EventList events={events} />;
}
```

3. **Use server components:**
```typescript
// Server Component (default in App Router)
async function EventList() {
  const events = await db.events.findMany();
  return <div>{/* ... */}</div>;
}
```

### High Memory Usage

**Diagnosis:**
```bash
# Monitor memory
node --inspect apps/web/server.js
# Open chrome://inspect in Chrome

# Or use clinic.js
npm install -g clinic
clinic doctor -- node apps/web/server.js
```

**Solutions:**

1. **Implement pagination:**
```typescript
// ❌ Bad - Loading all records
const events = await db.events.findMany();

// ✅ Good - Paginate
const events = await db.events.findMany({
  take: 20,
  skip: page * 20,
});
```

2. **Stream large responses:**
```typescript
// API route
export async function GET(request: Request) {
  const stream = new ReadableStream({
    async start(controller) {
      for await (const chunk of largeDataset) {
        controller.enqueue(chunk);
      }
      controller.close();
    },
  });

  return new Response(stream);
}
```

## Getting Help

If you can't find a solution here:

1. **Search GitHub Issues:** [github.com/losol/eventuras/issues](https://github.com/losol/eventuras/issues)
2. **Ask on Discussions:** [github.com/losol/eventuras/discussions](https://github.com/losol/eventuras/discussions)
3. **Check Documentation:** Read the relevant docs in `/docs` folder
4. **Contact Maintainers:** See [CONTRIBUTING.md](../../CONTRIBUTING.md)

### Reporting Bugs

When reporting an issue, include:

- Operating system and version
- Node.js version (`node --version`)
- .NET version (`dotnet --version`)
- Steps to reproduce
- Expected vs actual behavior
- Error messages and stack traces
- Screenshots if relevant

**Template:**
```markdown
## Description
Brief description of the issue

## Environment
- OS: macOS 13.0
- Node.js: 20.10.0
- .NET: 8.0.100
- Browser: Chrome 120

## Steps to Reproduce
1. Step one
2. Step two
3. ...

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Error Messages
```
[Paste error here]
```

## Screenshots
[If applicable]
```
