# Dockerfile for ConvertoAPI (HTML to PDF conversion microservice)
#
# Build from monorepo root:
#   docker build -f apps/convertoapi/Dockerfile -t converto:latest .
#
##################
# Stage 1: Build #
##################
FROM mcr.microsoft.com/playwright:v1.57.0-noble AS builder

# Get the needed package files
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/convertoapi/package.json ./apps/convertoapi/package.json
COPY libs/eslint-config/package.json ./libs/eslint-config/package.json
COPY libs/typescript-config/package.json ./libs/typescript-config/package.json

# Enable pnpm and install all dependencies (including devDependencies for build)
RUN corepack enable && \
    COREPACK_ENABLE_STRICT=0 corepack prepare pnpm@10.27.0 --activate && \
    pnpm install --ignore-scripts

# Copy source files after install
COPY apps/convertoapi/public ./apps/convertoapi/public
COPY libs/typescript-config ./libs/typescript-config

# Build the app
COPY apps/convertoapi ./apps/convertoapi
WORKDIR /app/apps/convertoapi
RUN pnpm run build


##################################
# Stage 2: Run from a fresh base #
##################################
FROM mcr.microsoft.com/playwright:v1.57.0-noble

# pwuser ist the standard non-root user
USER pwuser

# Get generated files from the previous stage
WORKDIR /app
COPY --chown=pwuser:pwuser --from=builder /app/apps/convertoapi/public /app/public
COPY --chown=pwuser:pwuser --from=builder /app/node_modules /app/node_modules
COPY --chown=pwuser:pwuser --from=builder /app/apps/convertoapi/package.json /app/package.json
COPY --chown=pwuser:pwuser --from=builder /app/apps/convertoapi/dist /app/dist

# Start the server
CMD ["node", "dist/app.js"]
