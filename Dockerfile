# ── Stage 1: deps ─────────────────────────────────────────────────────────
FROM oven/bun:1 AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# ── Stage 2: build ────────────────────────────────────────────────────────
FROM oven/bun:1 AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bun run build

# ── Stage 3: node runtime ─────────────────────────────────────────────────
FROM oven/bun:1-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/package.json ./
EXPOSE 3000
CMD ["sh", "-c", "bun run generate:movies && bun --bun dist/server/server.js"]

# ── Stage 4: nginx avec les assets du même build ──────────────────────────
FROM nginx:alpine AS nginx-runner
# Assets client issus du même build que le serveur node → hashes identiques
COPY --from=builder /app/dist/client/assets /app/dist/client/assets
COPY nginx.conf /etc/nginx/conf.d/default.conf
