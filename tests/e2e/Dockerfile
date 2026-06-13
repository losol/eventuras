# syntax=docker/dockerfile:1.7
# Build from monorepo root:
#   docker build -f tests/e2e/Dockerfile -t eventuras-e2e:latest .
#
# Based on the official Playwright image, which ships the browsers and their OS
# dependencies pre-installed — so the build never downloads a browser at build
# time (a flaky CDN download used to hang the build). Keep the image tag in sync
# with the @playwright/test version in tests/e2e/package.json.

##########################
# Base                   #
##########################
FROM mcr.microsoft.com/playwright:v1.60.0-noble AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# Install pnpm as a real global binary instead of via corepack. corepack fetches
# the pinned pnpm into a per-user cache on first use, so the root-prepared copy
# isn't visible to the non-root `pwuser` at runtime — it would re-download (and
# need a writable HOME). A global install is world-readable and never downloads
# at runtime. Keep the version matching the repo's packageManager field.
RUN npm install -g pnpm@11.5.0 \
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
# Runner                 #
##########################
FROM install AS runner

WORKDIR /app/tests/e2e

ENV CI=true
ENV NODE_ENV=test

# Test configuration (override via K8s env/secrets)
# E2E_WEB_URL - URL of the web app to test
# E2E_OTP_SOURCE - gmail | mailpit
# E2E_MAILPIT_API_URL - Mailpit REST API (when E2E_OTP_SOURCE=mailpit)
# E2E_GMAIL_* - OAuth credentials (when E2E_OTP_SOURCE=gmail)
# E2E_ADMIN_EMAIL / E2E_SYSTEMADMIN_EMAIL / E2E_USER_EMAIL_PATTERN - persona logins

# The base image ships a non-root `pwuser`; give it ownership of the e2e subtree
# where the suite writes (test-results, playwright-report, allure-results, tmp/auth).
RUN chown -R pwuser:pwuser /app/tests/e2e
USER pwuser

CMD ["pnpm", "test"]
