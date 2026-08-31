# --- Build stage -----------------------------------------------------------
FROM node:22-bookworm-slim AS build
WORKDIR /app

# better-sqlite3 needs a C++ toolchain to build its native binding.
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# --- Runtime stage -----------------------------------------------------------
FROM node:22-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=build /app/dist ./dist
RUN mkdir -p /app/data

EXPOSE 3000
CMD ["node", "dist/main.js"]
