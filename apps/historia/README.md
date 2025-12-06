# Historia - The CMS where stories are told

Historia is a CMS that allows you to create and manage stories. It is built on top of [Payload](https://payloadcms.com), a headless CMS that provides a powerful and flexible API for your data.

**Experimental, not ready for production use yet**

## Local Development with Vipps Payment Testing

Vipps requires HTTPS for callback URLs. For local development, you need to expose your localhost through a secure tunnel.

### Setting up Cloudflare Tunnel

1. **Login to Cloudflare:**

   ```bash
   cloudflared tunnel login
   ```

2. **Create a named tunnel:**

   ```bash
   cloudflared tunnel create historia-dev
   ```

3. **Create a config file** at `~/.cloudflared/config.yml`:

   ```yaml
   tunnel: dev
   credentials-file: /Users/YOUR_USERNAME/.cloudflared/<TUNNEL_ID>.json

   ingress:
     - hostname: historia-dev.YOUR-DOMAIN.com
       service: http://localhost:3100
     - service: http_status:404
   ```

4. **Create a DNS record** in Cloudflare dashboard:
   - Type: `CNAME`
   - Name: `dev` (or your preferred subdomain)
   - Target: `<TUNNEL_ID>.cfargotunnel.com`
   - Proxied: Yes

5. **Run the tunnel:**

   ```bash
   cloudflared tunnel run historia-dev
   ```

6. **Update your `.env` file:**

   ```bash
   NEXT_PUBLIC_CMS_URL=https://historia-dev.YOUR-DOMAIN.com
   ```

Now your tunnel URL will remain the same across restarts!

**Alternative:** If you don't have a custom domain, you can use the free tunnel but create a bash alias to make it easier:

```bash
# Add to ~/.bashrc or ~/.zshrc
alias historia-tunnel='cloudflared tunnel --url http://localhost:3100'
```

## Database Migrations

Historia uses Payload CMS's built-in migration system. When you modify collections or fields, you should create and run migrations:

```bash
# Generate a migration based on schema changes
pnpm payload migrate:create

# Run pending migrations
pnpm payload migrate

# Check migration status
pnpm payload migrate:status

# Refresh the database (drops all tables and recreates - development only!)
pnpm payload migrate:refresh
```

Migrations are stored in `src/migrations/` and are automatically run when the application starts in production.
