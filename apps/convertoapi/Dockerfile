# Dockerfile for ConvertoAPI (HTML to PDF conversion microservice)
#
# Build from monorepo root:
#   docker build -f apps/convertoapi/Dockerfile -t converto:latest .
#
##################
# Stage 1: Build #
##################
FROM mcr.microsoft.com/playwright:v1.58.1-noble AS builder

# Get the needed package files
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/convertoapi/package.json ./apps/convertoapi/package.json
COPY libs/eslint-config/package.json ./libs/eslint-config/package.json
COPY libs/typescript-config/package.json ./libs/typescript-config/package.json

# Enable pnpm and install all dependencies (including devDependencies for build)
RUN corepack enable && \
    COREPACK_ENABLE_STRICT=0 corepack prepare pnpm@10.28.2 --activate && \
    pnpm install --ignore-scripts

# Copy source files after install
COPY apps/convertoapi/public ./apps/convertoapi/public
COPY libs/typescript-config ./libs/typescript-config

# Build the app
COPY apps/convertoapi ./apps/convertoapi
WORKDIR /app/apps/convertoapi
RUN pnpm run build

# Deploy with production dependencies only
RUN pnpm --filter @eventuras/convertoapi deploy --prod --legacy /app/deploy


##################################
# Stage 2: Run from a fresh base #
##################################
FROM mcr.microsoft.com/playwright:v1.58.1-noble

# Install tini for proper signal handling (SIGTERM in k8s)
RUN apt-get update -qq && \
    apt-get install -y --no-install-recommends tini && \
    rm -rf /var/lib/apt/lists/*

# Switch to non-root user
USER pwuser

# Get generated files from the previous stage
WORKDIR /app
COPY --chown=pwuser:pwuser --from=builder /app/deploy/node_modules /app/node_modules
COPY --chown=pwuser:pwuser --from=builder /app/deploy/package.json /app/package.json
COPY --chown=pwuser:pwuser --from=builder /app/apps/convertoapi/dist /app/dist
COPY --chown=pwuser:pwuser --from=builder /app/apps/convertoapi/public /app/public

ENTRYPOINT ["tini", "--"]
CMD ["node", "dist/app.js"]
