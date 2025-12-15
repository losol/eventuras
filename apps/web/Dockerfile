# Get dependencies
FROM node:alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json ./
RUN corepack enable && corepack prepare pnpm@10.26.0 --activate && pnpm install --ignore-scripts

# Build next.js
FROM node:alpine AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN pnpm run build

# Copy to production image
FROM node:alpine AS runner
WORKDIR /app

ENV NODE_ENV production

# COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
RUN chown -R nextjs:nodejs /app/.next
USER nextjs

EXPOSE 3000
RUN node node_modules/.bin/next telemetry disable

CMD ["node_modules/.bin/next", "start"]
