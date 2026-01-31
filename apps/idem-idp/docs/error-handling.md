# Error Handling

## Overview

The IdP uses two layers of error handling:

1. **Express error handler** - Catches errors from API routes
2. **OIDC provider error handler** - Catches errors from OAuth flows

Both follow the same principle: **Log everything, show minimal details to users**.

## Express Error Handler

Location: `src/middleware/error-handler.ts`

### What It Does

**Logs (server-side only):**
```json
{
  "error": "Full error message",
  "stack": "Complete stack trace",
  "code": "ERROR_CODE",
  "status": 500,
  "method": "POST",
  "path": "/api/admin/clients",
  "query": {},
  "ip": "127.0.0.1"
}
```

**Returns to client:**

**Development:**
```json
{
  "error": "Detailed error message",
  "code": "ERROR_CODE",
  "stack": ["First 5 lines of stack trace"],
  "path": "/api/admin/clients"
}
```

**Production:**
```json
{
  "error": "Internal Server Error",
  "message": "Please try again later or contact support"
}
```

### Usage

The error handler is automatically applied to all routes. For async routes, use `asyncHandler`:

```typescript
import { asyncHandler } from '../middleware/error-handler';

router.get('/api/admin/clients', asyncHandler(async (req, res) => {
  // If this throws, errorHandler catches it
  const clients = await db.select().from(oauthClients);
  res.json({ clients });
}));
```

## OIDC Provider Error Handler

Location: `src/oidc/provider.ts` (renderError function)

### What It Does

**Logs (server-side only):**
```json
{
  "error": "Error message",
  "errorName": "InvalidRequestError",
  "errorCode": "invalid_request",
  "stack": "Stack trace (dev only)",
  "status": 400,
  "path": "/auth",
  "method": "GET",
  "oidcDetails": {
    "client": "dev_web_app",
    "session": "user-id",
    "prompt": "login"
  }
}
```

**Shows to user:**

**Development:**
- User-friendly error message
- Collapsible details with full error and stack trace
- "Go Back" and "Try Again" buttons

**Production:**
- Generic error message: "An error occurred during authentication"
- No technical details
- "Go Back" and "Try Again" buttons

### Example Error Page (Production)

```
Authentication Error

An error occurred during authentication. Please try again.

If the problem persists, please contact support.

[Go Back] [Try Again]
```

## Security Considerations

### ✅ What We Log

- Error messages
- Stack traces (dev only)
- Request paths and methods
- OIDC context (client IDs, prompts)
- IP addresses

### ❌ What We NEVER Log

- Passwords or secrets
- Full access tokens or refresh tokens
- Session cookies
- Personal identifiable information (PII) in plain text
- Credit card numbers or sensitive user data

### ✅ What Users See

**Development:**
- Detailed errors for debugging
- Stack traces in collapsible sections
- Request context

**Production:**
- Generic error messages
- No stack traces
- No internal details
- User-actionable suggestions

## Cookie Security

### Development

```typescript
{
  secure: false,  // Allow HTTP (localhost)
  httpOnly: true,
  sameSite: 'lax',
  signed: true
}
```

### Production

```typescript
{
  secure: true,  // Require HTTPS
  httpOnly: true,
  sameSite: 'lax',
  signed: true
}
```

Controlled by: `config.features.requireHttps` (false in development, true in production)

## Common Errors

### "Cannot send secure cookie over unencrypted connection"

**Cause:** Trying to set secure cookies over HTTP

**Fix:** Ensure `NODE_ENV=development` is set. The config automatically disables secure cookies in development.

**Verify:**
```bash
echo $NODE_ENV
# Should output: development
```

### Stack traces in production

**Cause:** `NODE_ENV` not set to `production`

**Fix:** Set `NODE_ENV=production` in your deployment environment

## Testing Error Handling

### Test Express Error Handler

```bash
# Trigger an error
curl http://localhost:3200/api/admin/clients

# Check logs
# Should see detailed error in console

# Check response
# Dev: Includes stack trace
# Prod: Generic message only
```

### Test OIDC Error Handler

```bash
# Trigger OAuth error (invalid client)
curl "http://localhost:3200/auth?client_id=invalid&response_type=code&redirect_uri=http://example.com"

# Check logs
# Should see OIDC error with context

# Check browser
# Dev: Shows collapsible error details
# Prod: Shows generic message
```

## Best Practices

1. **Always use asyncHandler for async routes**
   ```typescript
   router.get('/path', asyncHandler(async (req, res) => { ... }));
   ```

2. **Log before throwing custom errors**
   ```typescript
   if (!user) {
     logger.warn({ userId: req.params.id }, 'User not found');
     throw new Error('User not found');
   }
   ```

3. **Use appropriate HTTP status codes**
   ```typescript
   const error: any = new Error('Not found');
   error.status = 404;
   throw error;
   ```

4. **Never log sensitive data**
   ```typescript
   // ❌ BAD
   logger.error({ password: req.body.password }, 'Login failed');

   // ✅ GOOD
   logger.error({ email: req.body.email }, 'Login failed');
   ```

5. **Test both dev and production modes**
   ```bash
   NODE_ENV=development pnpm dev  # Detailed errors
   NODE_ENV=production pnpm start  # Generic errors
   ```
