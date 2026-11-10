FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package*.json ./
RUN npm install

# Rebuild the source code
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Production image (Hugging Face Spaces compatible)
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=7860
ENV HOSTNAME="0.0.0.0"

# Hugging Face Spaces runs containers with UID 1000
RUN addgroup --system --gid 1000 nodejs && \
    adduser --system --uid 1000 nextjs

RUN mkdir -p /app/.next/cache && chown -R 1000:1000 /app

COPY --from=builder --chown=1000:1000 /app/public ./public
COPY --from=builder --chown=1000:1000 /app/.next/standalone ./
COPY --from=builder --chown=1000:1000 /app/.next/static ./.next/static

RUN chmod -R 777 /app/.next/cache

USER 1000

EXPOSE 7860

CMD ["node", "server.js"]
