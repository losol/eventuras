# Dockerfile for Historia (Eventuras CMS)
#
# IMPORTANT: Build context must be the monorepo root (.)
#
# Build from monorepo root using BuildKit secrets:
#   docker build -f apps/historia/Dockerfile -t historia:latest \
#     --secret id=cms_secret,env=CMS_SECRET .
#
# Or with a file:
#   echo "your-secret" > /tmp/cms_secret
#   docker build -f apps/historia/Dockerfile -t historia:latest \
#     --secret id=cms_secret,src=/tmp/cms_secret .
#
# Run with environment variables:
#   docker run -e CMS_SECRET=your-secret -e DATABASE_URL=postgresql://... \
#     -p 3000:3000 historia:latest
#
# Base image
FROM node:24-bookworm-slim AS base

##########################
# Turbo Prune + Install  #
##########################
FROM base AS deps

# Install required system packages
RUN apt-get update && apt-get install -y --no-install-recommends libc6 && apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy only what is needed for turbo to determine the dependency graph
COPY package.json turbo.json tsconfig.json pnpm-workspace.yaml pnpm-lock.yaml ./

# Copy source for relevant apps and libs only (historia and its deps)
COPY apps/historia ./apps/historia
COPY libs ./libs

# Enable pnpm and prune with turbo using pnpm dlx
RUN corepack enable && \
    COREPACK_ENABLE_STRICT=0 corepack prepare pnpm@10.24.0 --activate
RUN pnpm dlx turbo prune --scope=@eventuras/historia --docker

##########################
# Dependencies           #
##########################
FROM base AS install

WORKDIR /app

# Enable pnpm
RUN corepack enable && \
    COREPACK_ENABLE_STRICT=0 corepack prepare pnpm@10.24.0 --activate

# Copy pruned files from previous stage
COPY --from=deps /app/out/json/ ./
COPY --from=deps /app/out/full/ ./

# Install dependencies (ignore scripts); no lockfile required
RUN pnpm install --frozen-lockfile=false --ignore-scripts

##########################
# Build                  #
##########################
FROM base AS builder

WORKDIR /app

ARG CMS_DEFAULT_LOCALE=no
ENV CMS_DEFAULT_LOCALE=${CMS_DEFAULT_LOCALE}
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=install /app ./

# Ensure pnpm is available
RUN corepack enable && \
    COREPACK_ENABLE_STRICT=0 corepack prepare pnpm@10.24.0 --activate

# Build dependencies first (all workspace packages that historia depends on)
RUN pnpm --filter=@eventuras/historia^... build

WORKDIR /app/apps/historia

# Run database migrations to create schema (uses SQLite for build)
# This creates the database structure needed for the build
RUN --mount=type=secret,id=cms_secret \
    CMS_SECRET=$(cat /run/secrets/cms_secret 2>/dev/null || echo "build-time-secret") \
    CMS_DATABASE_URL=file:./build-db.sqlite \
    pnpm dlx payload migrate

# Build the application with secret mount
# Secret is only available during build, not stored in image
RUN --mount=type=secret,id=cms_secret \
    CMS_SECRET=$(cat /run/secrets/cms_secret 2>/dev/null || echo "build-time-secret") \
    CMS_DATABASE_URL=file:./build-db.sqlite \
    pnpm run build

##########################
# Runtime                #
##########################
FROM base AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 --gid 1001 nextjs

# Copy runtime output only
COPY --from=builder --chown=nextjs:nodejs /app/apps/historia/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/apps/historia/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/historia/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules

USER nextjs

EXPOSE 3000

# Run migrations on startup, then start the server
# CMS_SECRET and DATABASE_URL must be provided at runtime
CMD ["/bin/sh", "-c", "pnpm dlx payload migrate && node server.js"]
