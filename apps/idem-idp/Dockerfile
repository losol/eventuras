#
# Build from repo root:
#   docker build -f apps/idem-idp/Dockerfile -t losolio/idem-idp:edge .
#
# Multi-arch build and push:
#   docker buildx build --platform linux/amd64,linux/arm64 \
#     -f apps/idem-idp/Dockerfile -t losolio/idem-idp:edge --push .
#

# ---- 0) PRUNE MONOREPO ----
FROM node:24-alpine AS prune
WORKDIR /repo

# Enable pnpm and use turbo via pnpm dlx
RUN corepack enable && corepack prepare pnpm@10.28.2 --activate

# Copy repo files including lockfile for turbo prune
COPY package.json turbo.json tsconfig.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps ./apps
COPY libs ./libs

# Prune to minimal graph for the idem-idp workspace
# - Ensure the workspace name matches apps/idem-idp/package.json "name"
RUN pnpm dlx turbo@^2 prune --scope=@eventuras/idem-idp --docker

# ---- 1) BUILD ----
FROM node:24-alpine AS build
WORKDIR /srv

# Copy pruned source and install dependencies
COPY --from=prune /repo/out/full/ ./
RUN corepack enable && corepack prepare pnpm@10.28.2 --activate && \
    pnpm install --frozen-lockfile=false && \
    pnpm dlx turbo@^2 run build --filter=@eventuras/idem-idp && \
    pnpm deploy --filter=@eventuras/idem-idp --prod --legacy /srv/deploy

# ---- 2) RUNTIME ----
FROM node:22-alpine AS runtime
WORKDIR /srv

# Build args propagated as labels/env
ARG APP_VERSION=dev
ARG GIT_SHA=unknown

# OCI labels
LABEL org.opencontainers.image.title="idem-idp" \
      org.opencontainers.image.version="${APP_VERSION}" \
      org.opencontainers.image.revision="${GIT_SHA}" \
      org.opencontainers.image.source="https://github.com/losol/eventuras"

# Also expose in env (handy for / and /health)
ENV NODE_ENV=production \
    APP_VERSION=${APP_VERSION} \
    GIT_SHA=${GIT_SHA} \
    PORT=3001

# Copy built artifacts (dependencies are bundled by tsup)
COPY --from=build /srv/deploy ./

# (rest unchanged)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD wget -qO- http://127.0.0.1:${PORT}/health || exit 1
EXPOSE 3001
CMD ["node", "--enable-source-maps", "dist/main.js"]
