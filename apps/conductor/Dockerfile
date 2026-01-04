# Dockerfile for Conductor (Webhook Gateway & Message Router)
#
# Build from monorepo root:
#   docker build -f apps/conductor/Dockerfile -t conductor:latest .
#
# Run with configuration:
#   docker run -v /path/to/config:/data/config -p 3000:3000 conductor:latest
#
##################
# Stage 1: Base  #
##################
FROM node:24-bookworm-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# Install security updates and clean up
RUN apt-get update && apt-get upgrade -y && \
    apt-get install -y --no-install-recommends \
    ca-certificates \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* \
    && corepack enable \
    && corepack prepare pnpm@10.27.0 --activate \
    && pnpm config set store-dir /pnpm/store

##################
# Stage 2: Build #
##################
FROM base AS builder

WORKDIR /app

# Copy package files for dependency resolution
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml turbo.json ./
COPY apps/conductor/package.json ./apps/conductor/package.json
COPY libs/logger/package.json ./libs/logger/package.json
COPY libs/typescript-config/package.json ./libs/typescript-config/package.json

# Install all dependencies (including devDependencies for build)
RUN pnpm install --frozen-lockfile

# Copy source files
COPY apps/conductor ./apps/conductor
COPY libs/logger ./libs/logger
COPY libs/typescript-config ./libs/typescript-config

# Build the application
WORKDIR /app/apps/conductor
RUN pnpm run build

##########################
# Stage 3: Production    #
##########################
FROM base AS production

# Create non-root user for security
RUN groupadd -r conductor && useradd -r -g conductor conductor

WORKDIR /app

# Copy built application and production dependencies
COPY --from=builder --chown=conductor:conductor /app/apps/conductor/dist ./dist
COPY --from=builder --chown=conductor:conductor /app/apps/conductor/package.json ./package.json

# Copy node_modules (contains production dependencies)
COPY --from=builder --chown=conductor:conductor /app/node_modules ./node_modules

# Create config directory with proper permissions
RUN mkdir -p /data/config && chown -R conductor:conductor /data/config

# Switch to non-root user
USER conductor

# Set environment variables
ENV NODE_ENV=production \
    PORT=3000 \
    CONFIG_DIR=/data/config

# Expose application port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

# Start the application
CMD ["node", "dist/index.js"]
