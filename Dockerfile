FROM node:20 AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ── Production image ──
# node:20 (not alpine) to ensure glibc compatibility with native addons in node_modules.
# We copy node_modules from the builder to avoid re-installing with --omit=dev;
# vite is an external import in the esbuild output and is required at startup even
# in production (it is imported unconditionally at the top of server/vite.ts).
FROM node:20

WORKDIR /app

COPY package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

ENV NODE_ENV=production
ENV REPLIT_ENVIRONMENT=true
ENV HTTP_MODE=true

EXPOSE 5000

CMD ["node", "dist/index.js"]
