# syntax=docker/dockerfile:1.7
# Build from monorepo root:
#   docker build -f tests/e2e/Dockerfile -t eventuras-e2e:latest .

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
# Install                #
##########################
FROM base AS install

WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY tests/e2e ./tests/e2e
COPY libs ./libs

# event-sdk resolves the OpenAPI spec via @eventuras/api's exports map
COPY apps/api/package.json ./apps/api/package.json
COPY apps/api/docs/eventuras-v3.json ./apps/api/docs/eventuras-v3.json

RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
  pnpm install --frozen-lockfile --ignore-scripts --filter=@eventuras/e2e...

# Build workspace dependencies (e.g. @eventuras/logger) that were skipped by --ignore-scripts
RUN pnpm --filter=@eventuras/e2e^... run build

##########################
# Playwright browsers    #
##########################
FROM install AS browsers

WORKDIR /app/tests/e2e

ENV PLAYWRIGHT_BROWSERS_PATH=/opt/playwright
RUN pnpm exec playwright install --with-deps chromium

##########################
# Runner                 #
##########################
FROM browsers AS runner

WORKDIR /app/tests/e2e

# Create non-root user for running tests
RUN groupadd -r pwuser && useradd -r -g pwuser -G audio,video pwuser \
  && mkdir -p /home/pwuser && chown -R pwuser:pwuser /home/pwuser \
  && chown -R pwuser:pwuser /app

ENV CI=true
ENV NODE_ENV=test

# Test configuration (override via K8s env/secrets)
# E2E_WEB_URL - URL of the web app to test
# E2E_BASE_EMAIL - Gmail base address
# E2E_GMAIL_* - OAuth credentials

USER pwuser

CMD ["pnpm", "test"]
