# Dockerfile for Historia (Eventuras CMS)

#
# Build from monorepo root using BuildKit secrets:
#   docker build -f apps/historia/Dockerfile -t historia:latest \
#     --secret id=cms_secret,env=CMS_SECRET .

#
# Base image
FROM node:24-bookworm-slim AS base

# Install sharp dependencies for Next.js image optimization
# https://sharp.pixelplumbing.com/install#linux-memory-allocator
RUN apt-get update && apt-get install -y --no-install-recommends \
    libc6 \
    libstdc++6 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

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

# Enable pnpm and prune with turbo using pnpm dlx
RUN corepack enable && \
    COREPACK_ENABLE_STRICT=0 corepack prepare pnpm@10.26.0 --activate
RUN pnpm dlx turbo prune --scope=@eventuras/historia --docker

##########################
# Dependencies           #
##########################
FROM base AS install

WORKDIR /app

# Enable pnpm
RUN corepack enable && \
    COREPACK_ENABLE_STRICT=0 corepack prepare pnpm@10.26.0 --activate

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

ARG NEXT_PUBLIC_CMS_DEFAULT_LOCALE=no
ENV NEXT_PUBLIC_CMS_DEFAULT_LOCALE=${NEXT_PUBLIC_CMS_DEFAULT_LOCALE}
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=install /app ./

# Ensure pnpm is available
RUN corepack enable && \
    COREPACK_ENABLE_STRICT=0 corepack prepare pnpm@10.26.0 --activate

# Build dependencies first (all workspace packages that historia depends on)
RUN pnpm --filter=@eventuras/historia^... build

WORKDIR /app/apps/historia


RUN pnpm next build --webpack --experimental-build-mode compile

##########################
# Runtime                #
##########################
FROM base AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

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
