# syntax=docker/dockerfile:1.7
# Dockerfile for Historia (Eventuras CMS)

#
# Build from monorepo root using BuildKit secrets:
#   docker build -f apps/historia/Dockerfile -t historia:latest \
#     --secret id=cms_secret,env=CMS_SECRET .

#
# Base image with pnpm pre-installed
FROM node:24-bookworm-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# Install sharp dependencies for Next.js / Payload image processing
# Prefer runtime packages over -dev to keep the image slimmer.
# https://sharp.pixelplumbing.com/install#linux-memory-allocator
RUN apt-get update && apt-get install -y --no-install-recommends \
    libc6 \
    libstdc++6 \
  libvips \
    ca-certificates \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* \
    && corepack enable \
  && corepack prepare pnpm@10.27.0 --activate \
  && pnpm config set store-dir /pnpm/store

##########################
# Turbo Prune + Install  #
##########################
FROM base AS deps

WORKDIR /app

# Copy only what is needed for turbo to determine the dependency graph
COPY package.json turbo.json tsconfig.json pnpm-workspace.yaml pnpm-lock.yaml ./

# Copy source for relevant apps and libs only (historia and its deps)
COPY apps/historia ./apps/historia
COPY libs ./libs

# Prune with turbo using pnpm dlx
RUN pnpm dlx turbo prune --scope=@eventuras/historia --docker

##########################
# Dependencies           #
##########################
FROM base AS install

WORKDIR /app

# Copy pruned files from previous stage
COPY --from=deps /app/out/json/ ./
COPY --from=deps /app/out/full/ ./

# Workaround: turbo prune currently produces a pnpm-lock.yaml that can be missing
# some peer-resolution entries (seen as ERR_PNPM_LOCKFILE_MISSING_DEPENDENCY).
# Using the repo lockfile keeps installs deterministic while avoiding the prune bug.
COPY --from=deps /app/pnpm-lock.yaml ./pnpm-lock.yaml

# Install dependencies with frozen lockfile for consistent and faster builds
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
  pnpm install --frozen-lockfile --ignore-scripts

##########################
# Build                  #
##########################
FROM base AS builder

WORKDIR /app

# Accept Turborepo cache tokens from build args
ARG TURBO_TOKEN
ARG TURBO_TEAM
ENV TURBO_TOKEN=${TURBO_TOKEN}
ENV TURBO_TEAM=${TURBO_TEAM}

ARG NEXT_PUBLIC_CMS_DEFAULT_LOCALE=no
ENV NEXT_PUBLIC_CMS_DEFAULT_LOCALE=${NEXT_PUBLIC_CMS_DEFAULT_LOCALE}
ENV NEXT_TELEMETRY_DISABLED=1

# Sentry configuration for build-time injection (required for NEXT_PUBLIC_* vars)
ARG FEATURE_SENTRY=false
ARG NEXT_PUBLIC_CMS_SENTRY_DSN
ARG CMS_SENTRY_ORG
ARG CMS_SENTRY_PROJECT
ARG NEXT_PUBLIC_CMS_SENTRY_SEND_DEFAULT_PII=false
ENV FEATURE_SENTRY=${FEATURE_SENTRY}
ENV NEXT_PUBLIC_CMS_SENTRY_DSN=${NEXT_PUBLIC_CMS_SENTRY_DSN}
ENV CMS_SENTRY_ORG=${CMS_SENTRY_ORG}
ENV CMS_SENTRY_PROJECT=${CMS_SENTRY_PROJECT}
ENV NEXT_PUBLIC_CMS_SENTRY_SEND_DEFAULT_PII=${NEXT_PUBLIC_CMS_SENTRY_SEND_DEFAULT_PII}
# Note: CMS_SENTRY_AUTH_TOKEN is mounted as BuildKit secret during build (not stored in image)

COPY --from=install /app ./

# Build dependencies first (all workspace packages that historia depends on)
# Use turbo so remote caching (TURBO_TOKEN/TURBO_TEAM) actually applies.
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
  --mount=type=cache,id=turbo-cache,target=/app/.turbo \
  pnpm dlx turbo run build --filter=@eventuras/historia^...

WORKDIR /app/apps/historia

# Build with Sentry auth token mounted as secret (not stored in image)
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
  --mount=type=cache,id=next-cache,target=/app/apps/historia/.next/cache \
  --mount=type=secret,id=sentry_auth_token,env=CMS_SENTRY_AUTH_TOKEN \
  pnpm next build --webpack --experimental-build-mode compile

##########################
# Runtime                #
##########################
FROM base AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Sentry runtime environment variables
# Note: CMS_SENTRY_DSN is for server-side, NEXT_PUBLIC_CMS_SENTRY_DSN is baked in at build-time
ARG FEATURE_SENTRY=false
ARG CMS_SENTRY_DSN
ENV FEATURE_SENTRY=${FEATURE_SENTRY}
ENV CMS_SENTRY_DSN=${CMS_SENTRY_DSN}

# Create non-root user
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 --gid 1001 nextjs

# Copy runtime output only
COPY --from=builder --chown=nextjs:nodejs /app/apps/historia/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/apps/historia/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/historia/.next/static ./apps/historia/.next/static

# Copy node_modules for payload CLI
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/apps/historia/node_modules ./apps/historia/node_modules

# Copy payload config and migrations
COPY --from=builder --chown=nextjs:nodejs /app/apps/historia/src/payload.config.ts ./apps/historia/src/payload.config.ts
COPY --from=builder --chown=nextjs:nodejs /app/apps/historia/src/migrations ./apps/historia/src/migrations

# Create ISR cache directory with correct permissions
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
RUN mkdir -p ./apps/historia/.next/server && chown -R nextjs:nodejs ./apps/historia/.next

USER nextjs

EXPOSE 3000

# Health check - uses PORT environment variable
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD node -e "const port = process.env.PORT || 3000; require('http').get(\`http://localhost:\${port}/api/health\`, (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start server - migrations run automatically via prodMigrations in payload.config.ts
# https://payloadcms.com/docs/database/migrations#running-migrations-in-production
CMD ["node", "apps/historia/server.js"]
