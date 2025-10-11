# Deployment Guide

This guide covers deploying Eventuras to production environments.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Environment Configuration](#environment-configuration)
- [Docker Deployment](#docker-deployment)
- [Cloud Deployment](#cloud-deployment)
- [Database Setup](#database-setup)
- [SSL/TLS Configuration](#ssltls-configuration)
- [Monitoring & Logging](#monitoring--logging)
- [Production Checklist](#production-checklist)

## Overview

Eventuras supports multiple deployment strategies:

- **Docker Compose** - Simple containerized deployment
- **Kubernetes** - Scalable orchestrated deployment
- **Vercel** - Frontend deployment (Next.js apps)
- **Azure** - Backend API deployment
- **AWS** - Full-stack deployment

## Prerequisites

### Required Resources

- **Compute:**
  - Backend API: 2+ CPU cores, 4GB+ RAM
  - Frontend: 1+ CPU core, 2GB+ RAM
  - Database: 2+ CPU cores, 4GB+ RAM (separate instance recommended)

- **Storage:**
  - Database: 20GB+ SSD
  - Backups: 3x database size

- **Network:**
  - Domain name with SSL certificate
  - CDN for static assets (recommended)

### Required Services

- PostgreSQL 12+ database
- Auth0 account (or compatible OIDC provider)
- Email service (SendGrid, SMTP, etc.)
- (Optional) SMS service (Twilio)
- (Optional) PDF service (ConvertoAPI)
- (Optional) Error tracking (Sentry)

## Environment Configuration

### Backend API Environment Variables

Create a `.env.production` file or set environment variables:

```bash
# Database
DATABASE_URL="Host=db.example.com;Database=eventuras;Username=eventuras;Password=***"

# Authentication
Auth__Issuer="https://your-tenant.auth0.com/"
Auth__Audience="https://api.eventuras.yourdomain.com"

# Application Settings
AppSettings__BaseUri="https://api.eventuras.yourdomain.com"
AppSettings__AllowedOrigins="https://www.yourdomain.com,https://admin.yourdomain.com"
AppSettings__DefaultLocale="en-US"

# Email Configuration
AppSettings__EmailProvider="SendGrid"
SendGrid__EmailAddress="noreply@yourdomain.com"
SendGrid__Name="Eventuras"
SendGrid__Key="***"

# Optional: SMS
AppSettings__SmsProvider="Twilio"
Twilio__From="+15551234567"
Twilio__Sid="***"
Twilio__AuthToken="***"

# Optional: PDF Generation
Converto__PdfEndpointUrl="https://pdf.yourdomain.com/api/pdfcreo"
Converto__ApiToken="***"

# Optional: Payment
FeatureManagement__UseStripeInvoice="true"
Stripe__SecretKey="sk_live_***"
Stripe__PublishableKey="pk_live_***"

# Optional: Error Tracking
FeatureManagement__UseSentry="true"
Sentry__Dsn="https://***@sentry.io/***"
Sentry__Environment="production"

# Logging
Logging__LogLevel__Default="Information"
Sentry__SendDefaultPii="false"

# Health Checks
FeatureManagement__UseHealthchecks="true"
FeatureManagement__UseHealthchecksUI="true"

# Security
HTTPS_PORT="443"
WEBSITES_PORT="8080"
```

### Frontend Environment Variables

```bash
# API Configuration
NEXT_PUBLIC_API_BASE_URL="https://api.eventuras.yourdomain.com"
NEXT_PUBLIC_APPLICATION_URL="https://www.yourdomain.com"

# Authentication
NEXTAUTH_URL="https://www.yourdomain.com"
NEXTAUTH_SECRET="*** (generate with: openssl rand -base64 32)"
AUTH0_DOMAIN="your-tenant.auth0.com"
AUTH0_CLIENT_ID="***"
AUTH0_CLIENT_SECRET="***"
AUTH0_API_AUDIENCE="https://api.eventuras.yourdomain.com"

# Optional: Analytics
NEXT_PUBLIC_GA_ID="G-***"

# Optional: Error Tracking
NEXT_PUBLIC_SENTRY_DSN="https://***@sentry.io/***"
SENTRY_AUTH_TOKEN="***"
```

## Docker Deployment

### Using Docker Compose

1. **Create production docker-compose.yml:**

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    restart: always
    environment:
      POSTGRES_DB: eventuras
      POSTGRES_USER: eventuras
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U eventuras"]
      interval: 10s
      timeout: 5s
      retries: 5

  api:
    image: eventuras/api:latest
    restart: always
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      - ConnectionStrings__DefaultConnection=Host=postgres;Database=eventuras;Username=eventuras;Password=${DB_PASSWORD}
      - Auth__Issuer=${AUTH_ISSUER}
      - Auth__Audience=${AUTH_AUDIENCE}
      - SendGrid__Key=${SENDGRID_KEY}
      - ASPNETCORE_ENVIRONMENT=Production
    ports:
      - "5000:80"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  web:
    image: eventuras/web:latest
    restart: always
    depends_on:
      - api
    environment:
      - NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com
      - NEXTAUTH_URL=https://www.yourdomain.com
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - AUTH0_CLIENT_ID=${AUTH0_CLIENT_ID}
      - AUTH0_CLIENT_SECRET=${AUTH0_CLIENT_SECRET}
    ports:
      - "3000:3000"

  nginx:
    image: nginx:alpine
    restart: always
    depends_on:
      - api
      - web
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    ports:
      - "80:80"
      - "443:443"

volumes:
  postgres_data:
```

2. **Create .env file:**

```bash
DB_PASSWORD=***
AUTH_ISSUER=https://your-tenant.auth0.com/
AUTH_AUDIENCE=https://api.yourdomain.com
SENDGRID_KEY=***
NEXTAUTH_SECRET=***
AUTH0_CLIENT_ID=***
AUTH0_CLIENT_SECRET=***
```

3. **Deploy:**

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# Check logs
docker-compose logs -f

# Run migrations
docker-compose exec api dotnet ef database update
```

### Nginx Configuration

Create `nginx.conf`:

```nginx
events {
    worker_connections 1024;
}

http {
    upstream api {
        server api:80;
    }

    upstream web {
        server web:3000;
    }

    # Redirect HTTP to HTTPS
    server {
        listen 80;
        server_name api.yourdomain.com www.yourdomain.com;
        return 301 https://$server_name$request_uri;
    }

    # API Server
    server {
        listen 443 ssl http2;
        server_name api.yourdomain.com;

        ssl_certificate /etc/nginx/ssl/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/privkey.pem;

        # Security headers
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
        add_header X-Frame-Options "DENY" always;
        add_header X-Content-Type-Options "nosniff" always;

        location / {
            proxy_pass http://api;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection keep-alive;
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }

    # Web Server
    server {
        listen 443 ssl http2;
        server_name www.yourdomain.com;

        ssl_certificate /etc/nginx/ssl/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/privkey.pem;

        # Security headers
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
        add_header X-Frame-Options "DENY" always;
        add_header X-Content-Type-Options "nosniff" always;

        location / {
            proxy_pass http://web;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

## Cloud Deployment

### Vercel (Frontend)

1. **Install Vercel CLI:**
```bash
npm install -g vercel
```

2. **Login:**
```bash
vercel login
```

3. **Deploy:**
```bash
cd apps/web
vercel --prod
```

4. **Configure in Vercel Dashboard:**
   - Set environment variables
   - Configure custom domain
   - Set build settings:
     - Build Command: `npm run build`
     - Output Directory: `.next`
     - Root Directory: `apps/web`

### Azure App Service (Backend)

1. **Create App Service:**
```bash
az webapp create \
  --resource-group eventuras-rg \
  --plan eventuras-plan \
  --name eventuras-api \
  --runtime "DOTNET|8.0"
```

2. **Configure App Settings:**
```bash
az webapp config appsettings set \
  --resource-group eventuras-rg \
  --name eventuras-api \
  --settings \
    ConnectionStrings__DefaultConnection="***" \
    Auth__Issuer="***" \
    Auth__Audience="***"
```

3. **Deploy:**
```bash
cd apps/api
dotnet publish -c Release -o ./publish
az webapp deployment source config-zip \
  --resource-group eventuras-rg \
  --name eventuras-api \
  --src ./publish.zip
```

### AWS ECS (Full Stack)

1. **Create ECR repositories:**
```bash
aws ecr create-repository --repository-name eventuras/api
aws ecr create-repository --repository-name eventuras/web
```

2. **Build and push images:**
```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin \
  123456789.dkr.ecr.us-east-1.amazonaws.com

# Build and push API
docker build -t eventuras/api -f apps/api/Dockerfile .
docker tag eventuras/api:latest \
  123456789.dkr.ecr.us-east-1.amazonaws.com/eventuras/api:latest
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/eventuras/api:latest

# Build and push Web
docker build -t eventuras/web -f apps/web/Dockerfile .
docker tag eventuras/web:latest \
  123456789.dkr.ecr.us-east-1.amazonaws.com/eventuras/web:latest
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/eventuras/web:latest
```

3. **Create ECS task definition and service**
4. **Configure load balancer**
5. **Set up auto-scaling**

## Database Setup

### Managed PostgreSQL

#### Azure Database for PostgreSQL

```bash
# Create server
az postgres server create \
  --resource-group eventuras-rg \
  --name eventuras-db \
  --location eastus \
  --admin-user adminuser \
  --admin-password "***" \
  --sku-name GP_Gen5_2 \
  --version 15

# Create database
az postgres db create \
  --resource-group eventuras-rg \
  --server-name eventuras-db \
  --name eventuras

# Configure firewall
az postgres server firewall-rule create \
  --resource-group eventuras-rg \
  --server-name eventuras-db \
  --name AllowAppService \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0
```

#### AWS RDS

```bash
aws rds create-db-instance \
  --db-instance-identifier eventuras-db \
  --db-instance-class db.t3.medium \
  --engine postgres \
  --engine-version 15.4 \
  --master-username adminuser \
  --master-user-password "***" \
  --allocated-storage 20 \
  --vpc-security-group-ids sg-*** \
  --db-subnet-group-name eventuras-subnet-group \
  --backup-retention-period 7
```

### Database Migrations

Run migrations after deployment:

```bash
# Using Docker
docker-compose exec api dotnet ef database update

# Or direct connection
cd apps/api
dotnet ef database update --connection "Host=***;Database=eventuras;Username=***;Password=***"
```

### Backup Strategy

```bash
# Daily automated backups
0 2 * * * /usr/local/bin/backup-db.sh

# backup-db.sh
#!/bin/bash
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
FILENAME="eventuras_${DATE}.sql"

pg_dump -h db.example.com -U eventuras eventuras > "${BACKUP_DIR}/${FILENAME}"
gzip "${BACKUP_DIR}/${FILENAME}"

# Upload to S3
aws s3 cp "${BACKUP_DIR}/${FILENAME}.gz" s3://eventuras-backups/

# Keep only last 30 days locally
find ${BACKUP_DIR} -name "eventuras_*.sql.gz" -mtime +30 -delete
```

## SSL/TLS Configuration

### Let's Encrypt with Certbot

```bash
# Install Certbot
apt-get install certbot python3-certbot-nginx

# Obtain certificate
certbot --nginx -d api.yourdomain.com -d www.yourdomain.com

# Auto-renewal
certbot renew --dry-run

# Add to crontab
0 0 * * * certbot renew --quiet
```

### Azure App Service

SSL is automatically managed when you add a custom domain in the Azure Portal.

### Vercel

SSL certificates are automatically provisioned for custom domains.

## Monitoring & Logging

### Sentry Error Tracking

1. **Configure in environment:**
```bash
FeatureManagement__UseSentry="true"
Sentry__Dsn="https://***@sentry.io/***"
Sentry__Environment="production"
```

2. **Verify in Sentry dashboard**

### Application Insights (Azure)

```bash
# Add to appsettings
{
  "ApplicationInsights": {
    "InstrumentationKey": "***"
  }
}
```

### Health Checks

Enable health check endpoints:

```bash
FeatureManagement__UseHealthchecks="true"
FeatureManagement__UseHealthchecksUI="true"
```

Access at:
- `/health` - Health status
- `/healthchecks-ui` - Dashboard

### Log Aggregation

**Using ELK Stack:**

```yaml
# docker-compose.yml
services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.11.0
    environment:
      - discovery.type=single-node
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data

  logstash:
    image: docker.elastic.co/logstash/logstash:8.11.0
    volumes:
      - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf

  kibana:
    image: docker.elastic.co/kibana/kibana:8.11.0
    ports:
      - "5601:5601"
    depends_on:
      - elasticsearch
```

## Production Checklist

### Pre-Deployment

- [ ] All environment variables configured
- [ ] Database migrations tested
- [ ] SSL certificates valid
- [ ] Backup strategy implemented
- [ ] Monitoring configured
- [ ] Load testing completed
- [ ] Security audit passed

### Security

- [ ] HTTPS enforced everywhere
- [ ] Security headers configured
- [ ] CORS properly restricted
- [ ] Secrets stored securely (Key Vault, etc.)
- [ ] Database credentials rotated
- [ ] Rate limiting enabled
- [ ] DDoS protection configured

### Performance

- [ ] CDN configured for static assets
- [ ] Database indexes created
- [ ] Connection pooling configured
- [ ] Caching strategy implemented
- [ ] Auto-scaling configured
- [ ] Load balancer set up

### Reliability

- [ ] Database backups automated
- [ ] Health checks enabled
- [ ] Logging aggregation configured
- [ ] Error tracking enabled
- [ ] Alerts configured
- [ ] Disaster recovery plan documented

### Compliance

- [ ] GDPR compliance verified
- [ ] Data retention policy implemented
- [ ] Privacy policy updated
- [ ] Terms of service updated
- [ ] Cookie consent implemented

### Post-Deployment

- [ ] Smoke tests passed
- [ ] Monitoring dashboards created
- [ ] Alerts configured
- [ ] Team notified
- [ ] Documentation updated
- [ ] Rollback plan ready

## Rollback Procedure

If issues arise after deployment:

1. **Identify the problem**
   - Check error logs
   - Review monitoring dashboards
   - Verify health checks

2. **Quick rollback with Docker:**
```bash
# Rollback to previous version
docker-compose down
docker-compose pull api:previous-tag web:previous-tag
docker-compose up -d
```

3. **Database rollback:**
```bash
# Restore from backup
pg_restore -h localhost -U eventuras -d eventuras backup.sql

# Or rollback migration
dotnet ef database update PreviousMigrationName
```

4. **Vercel rollback:**
```bash
# Redeploy previous version
vercel rollback
```

5. **Notify stakeholders**

## Support

For deployment support:
- **Documentation:** Check `/docs/deployment/`
- **Issues:** [GitHub Issues](https://github.com/losol/eventuras/issues)
- **Email:** support@eventuras.com

## Further Reading

- [Docker Documentation](https://docs.docker.com/)
- [Vercel Deployment](https://vercel.com/docs/deployments/overview)
- [Azure App Service](https://docs.microsoft.com/en-us/azure/app-service/)
- [AWS ECS](https://docs.aws.amazon.com/ecs/)
