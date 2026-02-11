# syntax=docker/dockerfile:1.7
# Dockerfile for idem-admin (Eventuras Identity Admin)
#
# Build from monorepo root:
#   docker build -f apps/idem-admin/Dockerfile -t idem-admin:latest .

##########################
# Base                   #
##########################
FROM node:24-bookworm-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* \
    && corepack enable \
    && corepack prepare pnpm@10.28.2 --activate \
    && pnpm config set store-dir /pnpm/store

##########################
# Turbo Prune            #
##########################
FROM base AS deps

WORKDIR /app

# Copy only what turbo needs for dependency graph resolution
COPY package.json turbo.json tsconfig.json pnpm-workspace.yaml pnpm-lock.yaml ./

COPY apps/idem-admin ./apps/idem-admin
COPY libs ./libs

# Prune to only idem-admin and its workspace dependencies
RUN pnpm dlx turbo prune --scope=@eventuras/idem-admin --docker

##########################
# Install                #
##########################
FROM base AS install

WORKDIR /app

# Copy pruned package manifests and full source
COPY --from=deps /app/out/json/ ./
COPY --from=deps /app/out/full/ ./

# Use repo lockfile (turbo prune can produce incomplete lockfiles)
COPY --from=deps /app/pnpm-lock.yaml ./pnpm-lock.yaml

RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile --ignore-scripts

##########################
# Build                  #
##########################
FROM base AS builder

WORKDIR /app

# Turborepo remote cache (optional)
ARG TURBO_TOKEN
ARG TURBO_TEAM
ENV TURBO_TOKEN=${TURBO_TOKEN}
ENV TURBO_TEAM=${TURBO_TEAM}

ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=install /app ./

# Build workspace dependencies first (libs that idem-admin depends on)
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    --mount=type=cache,id=turbo-cache,target=/app/.turbo \
    pnpm dlx turbo run build --filter=@eventuras/idem-admin^...

WORKDIR /app/apps/idem-admin

# Build the Next.js app
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    --mount=type=cache,id=next-cache,target=/app/apps/idem-admin/.next/cache \
    pnpm next build

##########################
# Runtime                #
##########################
FROM node:24-bookworm-slim AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create non-root user
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 --gid 1001 nextjs

# Copy standalone output
COPY --from=builder --chown=nextjs:nodejs /app/apps/idem-admin/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/idem-admin/.next/static ./apps/idem-admin/.next/static

# Create ISR cache directory with correct permissions
RUN mkdir -p ./apps/idem-admin/.next/server && chown -R nextjs:nodejs ./apps/idem-admin/.next

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
    CMD node -e "const port = process.env.PORT || 3000; require('http').get(\`http://localhost:\${port}/api/health\`, (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "apps/idem-admin/server.js"]
