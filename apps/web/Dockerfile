# syntax=docker/dockerfile:1.7
# Build from monorepo root:
#   docker build -f apps/web/Dockerfile -t eventuras-web:latest .

##########################
# Base                   #
##########################
FROM node:24-bookworm-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN apt-get update && apt-get install -y --no-install-recommends \
    libc6 \
    libstdc++6 \
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

COPY package.json turbo.json tsconfig.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/web ./apps/web
COPY libs ./libs

RUN pnpm dlx turbo prune --scope=@eventuras/web --docker

##########################
# Install                #
##########################
FROM base AS install

WORKDIR /app

COPY --from=deps /app/out/json/ ./
COPY --from=deps /app/out/full/ ./
COPY --from=deps /app/pnpm-lock.yaml ./pnpm-lock.yaml

RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
  pnpm install --frozen-lockfile --ignore-scripts

##########################
# Build                  #
##########################
FROM base AS builder

WORKDIR /app

ARG TURBO_TOKEN
ARG TURBO_TEAM
ENV TURBO_TOKEN=${TURBO_TOKEN}
ENV TURBO_TEAM=${TURBO_TEAM}
ENV NEXT_TELEMETRY_DISABLED=1

# No NEXT_PUBLIC_* build args needed – all configuration is read server-side
# at runtime and injected by the container platform (k8s / docker-compose).
COPY --from=install /app ./

RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
  --mount=type=cache,id=turbo-cache,target=/app/.turbo \
  pnpm dlx turbo run build --filter=@eventuras/web^...

WORKDIR /app/apps/web

RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
  --mount=type=cache,id=next-cache,target=/app/apps/web/.next/cache \
  export NODE_OPTIONS="--max-old-space-size=4096" && \
  pnpm next build

##########################
# Runtime                #
##########################
FROM base AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 --gid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "apps/web/server.js"]

EXPOSE 3000
RUN node node_modules/.bin/next telemetry disable

CMD ["node_modules/.bin/next", "start"]
