#
# Build this from the repo root folder:
# docker build -f apps/idem-idp/Dockerfile -t eventuras/idem-idp:latest .
#
#
# ---- 0) PRUNE MONOREPO ----
FROM node:22-alpine AS prune
WORKDIR /repo

# Install turbo CLI globally (avoids npx quirks)
RUN npm i -g turbo@^2

# Copy repo so turbo can read turbo.json/workspaces
COPY . .

# Prune to minimal graph for the idem-idp workspace
# - Ensure the workspace name matches apps/idem-idp/package.json "name"
RUN turbo prune --scope=@eventuras/idem-idp --docker

# ---- 1) INSTALL DEPS (LOCKED) ----
FROM node:22-alpine AS install
WORKDIR /srv

# Use pruned manifests for deterministic install
COPY --from=prune /repo/out/json/ ./
RUN npm ci

# ---- 2) BUILD ----
FROM node:22-alpine AS build
WORKDIR /srv

# Keep installed node_modules
COPY --from=install /srv/node_modules ./node_modules

# Bring in pruned source only
COPY --from=prune /repo/out/full/ ./

# Build just the idem-idp workspace
RUN npm run build --workspace=@eventuras/idem-idp

# ---- 3) RUNTIME ----
FROM node:22-alpine AS runtime
WORKDIR /srv

# Minimal runtime payload
COPY --from=build /srv/apps/idem-idp/package.json ./
COPY --from=build /srv/apps/idem-idp/dist ./dist
COPY --from=build /srv/node_modules ./node_modules

ENV NODE_ENV=production
ENV PORT=3200
EXPOSE 3200

# Optional healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD wget -qO- http://127.0.0.1:${PORT}/health || exit 1

CMD ["node", "--enable-source-maps", "dist/main.js"]
