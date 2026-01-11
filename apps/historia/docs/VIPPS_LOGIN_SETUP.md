# Vipps Login Setup Guide

This guide walks you through setting up Vipps Login authentication for Historia (Payload CMS).

## Prerequisites

- Vipps MobilePay developer account
- Registered Vipps application with Login API enabled
- HTTPS domain (required for production, use Cloudflare Tunnel for local dev)

## Step 1: Get Vipps Credentials

1. Log in to [Vipps Developer Portal](https://portal.vipps.no/)
2. Navigate to your application
3. Enable **Login API**
4. Note down:
   - Client ID
   - Client Secret
   - Subscription Key (for API access)

## Step 2: Configure Redirect URI

In Vipps Developer Portal:

1. Go to **Login API Settings**
2. Add redirect URI:
   - **Test**: `http://localhost:3100/api/auth/vipps/callback`
   - **Production**: `https://your-domain.com/api/auth/vipps/callback`

⚠️ **Important**: The redirect URI must **exactly match** what you configure in your `.env` file.

## Step 3: Configure Environment Variables

Copy `.env.example` to `.env` and update:

```bash
# Vipps API environment
VIPPS_API_URL=https://apitest.vipps.no  # Use https://api.vipps.no for production

# Vipps OAuth credentials
VIPPS_CLIENT_ID=your-client-id-from-vipps-portal
VIPPS_CLIENT_SECRET=your-client-secret-from-vipps-portal

# OAuth redirect URI (must match Vipps portal configuration)
VIPPS_LOGIN_REDIRECT_URI=http://localhost:3100/api/auth/vipps/callback

# Session encryption secret (generate with: openssl rand -hex 32)
SESSION_SECRET=generate-a-secure-random-secret-here

# Optional: Disable email/password login (default: false)
HISTORIA_AUTH_DISABLE_LOCAL_STRATEGY=false
```

### Generate Session Secret

```bash
openssl rand -hex 32
```

Copy the output to `SESSION_SECRET`.

## Step 4: Install Dependencies

The plugin is already configured in Historia. Just install dependencies:

```bash
pnpm install
```

## Step 5: Start Development Server

```bash
pnpm dev
```

Historia will start on `http://localhost:3100`.

## Step 6: Test Vipps Login

1. Navigate to `http://localhost:3100/admin`
2. You should see a **"Logg inn med Vipps"** button
3. Click the button
4. You'll be redirected to Vipps for authentication
5. Log in with your Vipps test user
6. After successful login, you'll be redirected back to `/admin`

## User Management

### First Login

When a user logs in with Vipps for the first time:

1. A new user account is automatically created
2. User data is populated from Vipps profile (name, email, phone, etc.)
3. User gets default role: `['user']`
4. Admin must manually assign tenant access

### Role Assignment

New Vipps users have no tenant access by default. To grant access:

1. Go to **Users** collection in Payload admin
2. Find the user
3. Scroll to **Tenants** sidebar
4. Click **Add Item**
5. Select website/tenant
6. Assign role: `site-member` or `site-admin`
7. Save

### Existing Users

If a user with the same email already exists:
- They will be logged in automatically
- User data is updated with latest Vipps profile info

⚠️ **Email Matching**: Users are matched by email. If a user changes their email in Vipps, they will be treated as a new user.

## Local Development with HTTPS

Vipps requires HTTPS in production. For local development, use Cloudflare Tunnel:

```bash
# Install Cloudflare Tunnel
brew install cloudflared

# Start tunnel
cloudflared tunnel --url http://localhost:3100
```

This gives you a public HTTPS URL like `https://random-name.trycloudflare.com`.

Update your `.env`:

```bash
VIPPS_LOGIN_REDIRECT_URI=https://random-name.trycloudflare.com/api/auth/vipps/callback
NEXT_PUBLIC_CMS_URL=https://random-name.trycloudflare.com
```

And update the redirect URI in Vipps Developer Portal.

## Production Deployment

### Environment Configuration

Update `.env` for production:

```bash
VIPPS_API_URL=https://api.vipps.no
VIPPS_CLIENT_ID=production-client-id
VIPPS_CLIENT_SECRET=production-client-secret
VIPPS_LOGIN_REDIRECT_URI=https://your-domain.com/api/auth/vipps/callback
SESSION_SECRET=super-secure-random-secret
NEXT_PUBLIC_CMS_URL=https://your-domain.com
```

### Security Checklist

- [ ] Use production Vipps credentials
- [ ] Generate new secure `SESSION_SECRET`
- [ ] Ensure `HTTPS` for all URLs
- [ ] Configure proper CORS in `payload.config.ts`
- [ ] Consider enabling `HISTORIA_AUTH_DISABLE_LOCAL_STRATEGY=true` for Vipps-only auth
- [ ] Test login flow end-to-end

### Multi-Instance Deployments

⚠️ **Important**: The default PKCE state storage is **in-memory** and won't work across multiple server instances.

For production with load balancing:
1. Implement Redis-based PKCE storage
2. Or use sticky sessions in your load balancer

## Troubleshooting

### "Invalid redirect URI" error

- Redirect URI in `.env` doesn't match Vipps portal configuration
- **Fix**: Ensure exact match including protocol and path

### "No email" error

- User's Vipps account has no verified email
- **Fix**: User must verify email in Vipps app

### "Invalid state" error

- PKCE state expired (10 minute TTL)
- User took too long to complete login
- **Fix**: Retry login

### Session not persisting

- Cookie encryption secret changed
- Not using HTTPS in production
- **Fix**: Use consistent `SESSION_SECRET` and enable HTTPS

### Can't login after Vipps authentication

- User created but session cookie not set
- Browser blocking third-party cookies
- **Fix**: Check browser console for errors, ensure HTTPS

## Customization

### Custom User Mapping

Edit `apps/historia/src/plugins.ts` to customize how Vipps data maps to user fields:

```typescript
vippsAuthPlugin({
  mapVippsUser: (vippsUser) => ({
    email: vippsUser.email,
    given_name: vippsUser.given_name,
    family_name: vippsUser.family_name,
    phone_number: vippsUser.phone_number,
    // Custom: Auto-assign admin role for @losol.io emails
    roles: vippsUser.email?.endsWith('@losol.io') ? ['admin'] : ['user'],
    // Custom: Map Vipps addresses
    addresses: vippsUser.addresses?.map((addr) => ({
      label: 'Vipps',
      isDefault: true,
      ...addr,
    })),
  }),
})
```

### Disable Local Authentication

To enforce Vipps-only authentication:

```bash
HISTORIA_AUTH_DISABLE_LOCAL_STRATEGY=true
```

⚠️ **Warning**: Make sure you have a Vipps account set up as admin before enabling this!

## Support

- [Vipps Login API Documentation](https://developer.vippsmobilepay.com/docs/APIs/login-api/)
- [Payload Custom Strategies](https://payloadcms.com/docs/authentication/custom-strategies)
- [Eventuras GitHub](https://github.com/losol/eventuras)
