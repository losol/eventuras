# Historia Deployment Guide

This guide covers the complete deployment setup for Historia across three environments: dev, staging, and production.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Azure Setup](#azure-setup)
- [GitHub Configuration](#github-configuration)
- [Database Setup](#database-setup)
- [Deployment Process](#deployment-process)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)
- [Rollback Procedures](#rollback-procedures)
- [Security](#security)

## Overview

Historia uses a three-environment deployment strategy:

- **historia-dev**: Preview environments for pull requests
- **historia-staging**: Automatic deployment from `main` branch
- **historia-prod**: Manual deployment from GitHub releases

All environments run as Docker containers on Azure App Service (Linux) and use Azure Database for PostgreSQL.

## Architecture

```
┌─────────────────┐
│  GitHub Actions │
│   CI/CD Pipeline│
└────────┬────────┘
         │
    ┌────┴─────┬────────────┬──────────────┐
    │          │            │              │
┌───▼───┐  ┌──▼──┐    ┌────▼────┐   ┌────▼────┐
│ Build │  │Lint │    │  Test   │   │ Docker  │
└───┬───┘  └─────┘    └─────────┘   └────┬────┘
    │                                     │
    │                                     ▼
    │                            ┌────────────────┐
    │                            │  Docker Hub    │
    │                            │ losolio/historia│
    │                            └────┬───────────┘
    │                                 │
    ├─────────────────┬───────────────┼──────────────┐
    │                 │               │              │
┌───▼──────┐    ┌─────▼─────┐   ┌────▼─────┐  ┌────▼─────┐
│Azure Dev │    │Azure Staging│  │Azure Prod│  │PostgreSQL│
│(PR Preview)│   │(Auto Deploy)│  │(Release) │  │ Database │
└──────────┘    └───────────┘   └──────────┘  └──────────┘
```

## Prerequisites

Before setting up deployments, ensure you have:

- Azure subscription with App Service and PostgreSQL
- Docker Hub account (losolio/historia repository)
- GitHub repository with Actions enabled
- Access to manage GitHub environments and secrets
- Azure CLI installed locally for setup

## Azure Setup

### 1. Create Resource Group

```bash
# Create resource group
az group create \
  --name rg-historia \
  --location norwayeast

# Or use existing resource group
RESOURCE_GROUP="rg-historia"
LOCATION="norwayeast"
```

### 2. Create Azure Web Apps

Create three App Service instances for the different environments:

```bash
# Create App Service Plan (Linux, Container support)
az appservice plan create \
  --name asp-historia \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION \
  --is-linux \
  --sku B1

# Dev environment
az webapp create \
  --name historia-dev \
  --resource-group $RESOURCE_GROUP \
  --plan asp-historia \
  --deployment-container-image-name losolio/historia:latest

# Staging environment
az webapp create \
  --name historia-staging \
  --resource-group $RESOURCE_GROUP \
  --plan asp-historia \
  --deployment-container-image-name losolio/historia:latest

# Production environment
az webapp create \
  --name historia-prod \
  --resource-group $RESOURCE_GROUP \
  --plan asp-historia \
  --deployment-container-image-name losolio/historia:latest
```

### 3. Configure Web Apps

Set container registry and enable continuous deployment:

```bash
# Configure Docker Hub registry for each environment
for ENV in dev staging prod; do
  az webapp config container set \
    --name historia-$ENV \
    --resource-group $RESOURCE_GROUP \
    --docker-custom-image-name losolio/historia:latest \
    --docker-registry-server-url https://index.docker.io/v1/

  # Enable continuous deployment
  az webapp deployment container config \
    --name historia-$ENV \
    --resource-group $RESOURCE_GROUP \
    --enable-cd true
done
```

### 4. Set Environment Variables

Configure application settings for each environment:

```bash
# Dev environment
az webapp config appsettings set \
  --name historia-dev \
  --resource-group $RESOURCE_GROUP \
  --settings \
    CMS_DATABASE_URL="postgresql://user:password@server.postgres.database.azure.com:5432/historia_dev" \
    CMS_SECRET="your-secret-key-dev" \
    NODE_ENV="development" \
    PAYLOAD_PUBLIC_SERVER_URL="https://historia-dev.azurewebsites.net" \
    WEBSITES_PORT=3000

# Staging environment
az webapp config appsettings set \
  --name historia-staging \
  --resource-group $RESOURCE_GROUP \
  --settings \
    CMS_DATABASE_URL="postgresql://user:password@server.postgres.database.azure.com:5432/historia_staging" \
    CMS_SECRET="your-secret-key-staging" \
    NODE_ENV="production" \
    PAYLOAD_PUBLIC_SERVER_URL="https://historia-staging.azurewebsites.net" \
    WEBSITES_PORT=3000

# Production environment
az webapp config appsettings set \
  --name historia-prod \
  --resource-group $RESOURCE_GROUP \
  --settings \
    CMS_DATABASE_URL="postgresql://user:password@server.postgres.database.azure.com:5432/historia_prod" \
    CMS_SECRET="your-secret-key-prod" \
    FEATURE_SENTRY="true" \
    NEXT_PUBLIC_SENTRY_DSN="https://your-key@o123456.ingest.sentry.io/123456" \
    NODE_ENV="production" \
    PAYLOAD_PUBLIC_SERVER_URL="https://historia-prod.azurewebsites.net" \
    WEBSITES_PORT=3000
```

**Note**: The `.azurewebsites.net` URLs above are default Azure URLs. For production, you'll typically configure a custom domain (e.g., `https://cms.yourdomain.com`) and update `PAYLOAD_PUBLIC_SERVER_URL` accordingly.

**Important for Sentry**:
- Set `FEATURE_SENTRY=true` in Azure App Service settings to enable Sentry in production
- The `NEXT_PUBLIC_SENTRY_DSN` variable must be set at **build time** as a GitHub Actions secret (see [GitHub Configuration](#github-configuration) below)
- Runtime variables like `CMS_SENTRY_DSN` and `FEATURE_SENTRY` can be set in Azure App Service settings

**Important for images (Next.js `/_next/image`)**:
- `apps/historia/next.config.js` reads `NEXT_PUBLIC_CMS_URL` and `CMS_ALLOWED_ORIGINS` during `next build` to generate `images.remotePatterns`.
- When using `output: 'standalone'` in a Docker image, this allowlist is baked into the build output.
- Therefore, if you rely on remote images (e.g. `https://web.example.com/api/media/file/...`), you must provide `NEXT_PUBLIC_CMS_URL` and `CMS_ALLOWED_ORIGINS` at **Docker build time** (via `--build-arg`) in CI/CD — not only as Azure App Service runtime app settings.

### 5. Download Publish Profiles

Download publish profiles for GitHub Actions:

```bash
# Dev
az webapp deployment list-publishing-profiles \
  --name historia-dev \
  --resource-group $RESOURCE_GROUP \
  --xml > historia-dev-publish-profile.xml

# Staging
az webapp deployment list-publishing-profiles \
  --name historia-staging \
  --resource-group $RESOURCE_GROUP \
  --xml > historia-staging-publish-profile.xml

# Production
az webapp deployment list-publishing-profiles \
  --name historia-prod \
  --resource-group $RESOURCE_GROUP \
  --xml > historia-prod-publish-profile.xml
```

**⚠️ Important**: These files contain sensitive credentials. Store them securely and never commit them to git.

## GitHub Configuration

### 1. Create GitHub Environments

Go to your repository settings → Environments and create:

**historia-dev**:
- No protection rules (auto-deploy on PR)

**historia-staging**:
- No protection rules (auto-deploy on merge to main)

**historia-prod**:
- ✅ Required reviewers (1-2 team members)
- ✅ Wait timer: 5 minutes (optional)

### 2. Configure Secrets

Add the following secrets to each environment:

#### Repository Secrets (for all environments)

Navigate to Settings → Secrets and variables → Actions → Repository secrets:

- `DOCKERHUB_USERNAME`: Your Docker Hub username
- `DOCKERHUB_TOKEN`: Your Docker Hub access token
- `CMS_SECRET`: Payload CMS secret key (used during build)
- `NEXT_PUBLIC_SENTRY_DSN`: Sentry DSN for client-side error tracking (e.g., `https://key@o123456.ingest.sentry.io/123456`)
- `CMS_SENTRY_ORG`: Sentry organization slug (e.g., `your-org`)
- `CMS_SENTRY_PROJECT`: Sentry project slug (e.g., `historia-prod`)
- `CMS_SENTRY_AUTH_TOKEN`: Sentry auth token for uploading source maps (create at https://sentry.io/settings/account/api/auth-tokens/)

**Note**:
- Generate a Docker Hub access token at https://hub.docker.com/settings/security instead of using your password.
- The `NEXT_PUBLIC_SENTRY_DSN` secret is used at **build time** to inject the DSN into the client-side bundle.
- The Sentry auth token needs `project:releases` and `project:write` scopes for source map uploads.

#### Environment Secrets

For each environment, add these secrets (the names are the same across environments, scoped by the environment itself):

**historia-dev environment**:
- `AZURE_WEBAPP_NAME`: `historia-dev`
- `AZURE_WEBAPP_PUBLISH_PROFILE`: Contents of `historia-dev-publish-profile.xml`

**historia-staging environment**:
- `AZURE_WEBAPP_NAME`: `historia-staging`
- `AZURE_WEBAPP_PUBLISH_PROFILE`: Contents of `historia-staging-publish-profile.xml`

**historia-prod environment**:
- `AZURE_WEBAPP_NAME`: `historia-prod`
- `AZURE_WEBAPP_PUBLISH_PROFILE`: Contents of `historia-prod-publish-profile.xml`

## Database Setup

### 1. Azure PostgreSQL

Create a PostgreSQL Flexible Server:

```bash
# Create PostgreSQL server
az postgres flexible-server create \
  --name psql-historia \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION \
  --admin-user historioadmin \
  --admin-password 'YourSecurePassword!' \
  --sku-name Standard_B1ms \
  --storage-size 32 \
  --version 16

# Create databases for each environment
az postgres flexible-server db create \
  --resource-group $RESOURCE_GROUP \
  --server-name psql-historia \
  --database-name historia_dev

az postgres flexible-server db create \
  --resource-group $RESOURCE_GROUP \
  --server-name psql-historia \
  --database-name historia_staging

az postgres flexible-server db create \
  --resource-group $RESOURCE_GROUP \
  --server-name psql-historia \
  --database-name historia_prod
```

### 2. Configure Firewall Rules

```bash
# Allow Azure services
az postgres flexible-server firewall-rule create \
  --resource-group $RESOURCE_GROUP \
  --name psql-historia \
  --rule-name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0

# Add your IP for local development (optional)
az postgres flexible-server firewall-rule create \
  --resource-group $RESOURCE_GROUP \
  --name psql-historia \
  --rule-name AllowMyIP \
  --start-ip-address YOUR_IP \
  --end-ip-address YOUR_IP
```

### 3. Connection Strings

Format: `postgresql://[user]:[password]@[server]:5432/[database]?sslmode=require`

Example:
```
postgresql://historioadmin:YourSecurePassword!@psql-historia.postgres.database.azure.com:5432/historia_prod?sslmode=require
```

### 4. Database Migrations

Historia uses Payload CMS's `prodMigrations` pattern. Migrations run automatically when the container starts:

- **First deployment**: All migrations run to set up schema
- **Subsequent deployments**: Only new migrations run
- **Rollback**: Payload CMS does not support automatic rollback

**Important**: Always test migrations in dev/staging before production!

## Deployment Process

### Dev Environment (Pull Request Preview)

1. Create a pull request with changes to `apps/historia/`
2. GitHub Actions automatically:
   - Runs lint and build
   - Builds Docker image with tag `dev-pr{number}-{sha}`
   - Deploys to `historia-dev`
   - Comments on PR with deployment URL
3. Test your changes at the preview URL
4. Preview environment persists until PR is closed

### Staging Environment (Continuous Deployment)

1. Merge pull request to `main` branch
2. GitHub Actions automatically:
   - Runs lint and build
   - Builds Docker image with tag `staging-{date}-{sha}`
   - Deploys to `historia-staging`
3. Staging reflects the latest `main` branch state
4. Use staging for final validation before production

### Production Environment (Release-Based)

Historia uses an **automated release process** powered by Changesets. When you merge a version bump to `main`, a GitHub release is automatically created and deployed to production.

#### Step-by-Step Release Process

**1. Create a changeset for your changes:**

```bash
# From the monorepo root
pnpm changeset

# Interactive prompts:
# → Select packages: @eventuras/historia
# → Version bump: patch (bug fixes) / minor (new features) / major (breaking changes)
# → Summary: Brief description of changes (appears in CHANGELOG)
```

This creates a file in `.changeset/` describing your changes.

**2. Commit and push the changeset:**

```bash
git add .changeset/
git commit -m "chore: add changeset for historia feature"
git push
```

**3. Merge your PR to `main`:**

Once your PR (including the changeset) is merged, the release workflow automatically:
- Creates a "Version Packages" PR
- Bumps version in `apps/historia/package.json`
- Updates `apps/historia/CHANGELOG.md`
- Removes consumed changesets

**4. Merge the "Version Packages" PR:**

When you merge this PR, the release workflow automatically:
- Creates git tag `@eventuras/historia@X.X.X`
- Creates GitHub release with auto-generated notes
- Triggers `historia-main.yml` workflow
- Builds Docker image with tags `vX.X.X` and `latest`
- Deploys to `historia-prod` environment

**5. Monitor deployment:**

Check GitHub Actions for deployment status. The workflow will:
- Comment on the release with deployment details
- Show Docker image tags used
- Confirm successful deployment to production

#### Quick Reference: Version Bump Types

| Type    | When to Use                           | Example        |
|---------|---------------------------------------|----------------|
| `patch` | Bug fixes, minor improvements         | 0.14.0 → 0.14.1 |
| `minor` | New features, backward compatible     | 0.14.0 → 0.15.0 |
| `major` | Breaking changes, API changes         | 0.14.0 → 1.0.0  |

#### Manual Release (Alternative)

If you need to create a release manually:

```bash
# 1. Update version and create git tag
pnpm changeset version
git add .
git commit -m "chore: version packages"
git push

# 2. Create and push tag manually
git tag @eventuras/historia@0.14.0
git push origin @eventuras/historia@0.14.0

# 3. Create GitHub release via UI
# Go to: https://github.com/losol/eventuras/releases/new
# Tag: @eventuras/historia@0.14.0
# Target: main
# Generate release notes and publish
```

The deployment workflow will still trigger automatically from the release.

#### Rollback a Release

If a release needs to be rolled back:

```bash
# Deploy previous version via Azure CLI
az webapp config container set \
  --name historia-prod \
  --resource-group $RESOURCE_GROUP \
  --docker-custom-image-name losolio/historia:v0.13.0
```

Or create a new patch release with the fix.

## Monitoring

### Application Logs

View application logs via Azure CLI:

```bash
# Tail logs
az webapp log tail \
  --name historia-prod \
  --resource-group $RESOURCE_GROUP

# Download logs
az webapp log download \
  --name historia-prod \
  --resource-group $RESOURCE_GROUP \
  --log-file historia-logs.zip
```

### Health Checks

Historia includes health check endpoints:

- `/api/health`: Application health status
- `/api/ready`: Readiness probe (database connectivity)

Configure Azure App Service health checks:

```bash
az webapp config set \
  --name historia-prod \
  --resource-group $RESOURCE_GROUP \
  --health-check-path /api/health
```

### Application Insights (Optional)

Enable Application Insights for advanced monitoring:

```bash
# Create Application Insights
az monitor app-insights component create \
  --app historia-insights \
  --location $LOCATION \
  --resource-group $RESOURCE_GROUP

# Get instrumentation key
INSTRUMENTATION_KEY=$(az monitor app-insights component show \
  --app historia-insights \
  --resource-group $RESOURCE_GROUP \
  --query instrumentationKey -o tsv)

# Configure Web App
az webapp config appsettings set \
  --name historia-prod \
  --resource-group $RESOURCE_GROUP \
  --settings \
    APPINSIGHTS_INSTRUMENTATIONKEY=$INSTRUMENTATION_KEY
```

## Troubleshooting

### Container Won't Start

1. Check container logs:
   ```bash
   az webapp log tail --name historia-prod --resource-group $RESOURCE_GROUP
   ```

2. Verify environment variables are set correctly

3. Check database connectivity:
   ```bash
   # Test from your local machine
   psql "postgresql://user:password@server.postgres.database.azure.com:5432/historia_prod?sslmode=require"
   ```

4. Verify Docker image exists:
   ```bash
   docker pull losolio/historia:v0.14.0
   ```

### Database Migration Failures

1. Check application logs for migration errors

2. Connect to database and verify schema:
   ```sql
   \dt  -- List tables
   SELECT * FROM payload_migrations;  -- Check migration history
   ```

3. If migration is stuck, you may need to manually fix:
   ```sql
   -- Rollback last migration (use with caution!)
   DELETE FROM payload_migrations WHERE name = 'problematic_migration_name';
   ```

### Slow Performance

1. Check App Service Plan size:
   ```bash
   az appservice plan show \
     --name asp-historia \
     --resource-group $RESOURCE_GROUP
   ```

2. Scale up if needed:
   ```bash
   az appservice plan update \
     --name asp-historia \
     --resource-group $RESOURCE_GROUP \
     --sku P1V2
   ```

3. Check database performance metrics in Azure Portal

4. Review and optimize database indexes (see collection configurations)

### Docker Hub Rate Limiting

If deployments fail due to rate limiting:

1. Use authenticated Docker Hub account (already configured via secrets)

2. Consider using Azure Container Registry instead:
   ```bash
   az acr create \
     --name acrhistoria \
     --resource-group $RESOURCE_GROUP \
     --sku Basic \
     --admin-enabled true
   ```

## Rollback Procedures

### Quick Rollback (Use Previous Docker Image)

```bash
# List recent images
docker search losolio/historia --limit 10

# Deploy previous version
az webapp config container set \
  --name historia-prod \
  --resource-group $RESOURCE_GROUP \
  --docker-custom-image-name losolio/historia:v0.13.0

# Restart the app
az webapp restart \
  --name historia-prod \
  --resource-group $RESOURCE_GROUP
```

### Full Rollback (Revert Code and Redeploy)

1. Identify the commit to revert to
2. Create a revert PR:
   ```bash
   git revert HEAD
   git push origin feature/revert-changes
   ```
3. Follow normal deployment process

### Database Rollback

⚠️ **Warning**: Payload CMS does not support automatic migration rollback.

If you need to rollback database changes:

1. Take a database backup first:
   ```bash
   pg_dump "postgresql://user:password@server.postgres.database.azure.com:5432/historia_prod?sslmode=require" > backup.sql
   ```

2. Manually revert problematic migrations using SQL

3. Update `payload_migrations` table to reflect rolled-back state

## Security

### Secrets Management

- ✅ Use Azure Key Vault for sensitive data (recommended for production)
- ✅ Rotate secrets regularly (every 90 days)
- ✅ Never commit secrets to git
- ✅ Use environment-specific secrets

### Database Security

- ✅ Use SSL connections (`sslmode=require`)
- ✅ Restrict firewall rules to known IPs
- ✅ Use strong passwords (minimum 16 characters)
- ✅ Enable Azure AD authentication (recommended)
- ✅ Regular backups (daily for production)

### Application Security

- ✅ Keep dependencies updated (`pnpm update`)
- ✅ Review Dependabot alerts
- ✅ Use HTTPS only (enforced by Azure App Service)
- ✅ Implement rate limiting for public APIs
- ✅ Regular security audits

### Docker Security

- ✅ Use official base images (node:24-bookworm-slim)
- ✅ Run as non-root user (configured in Dockerfile)
- ✅ Scan images for vulnerabilities
- ✅ Keep base images updated

## Additional Resources

- [Payload CMS Documentation](https://payloadcms.com/docs)
- [Azure App Service Documentation](https://docs.microsoft.com/azure/app-service/)
- [Docker Hub Repository](https://hub.docker.com/r/losolio/historia)
- [Changesets Documentation](https://github.com/changesets/changesets)

## Support

For issues or questions:

1. Check application logs first
2. Review troubleshooting section
3. Open an issue in the GitHub repository
4. Contact the development team

---

**Last updated**: December 13, 2024
