FROM oven/bun:1 AS builder

WORKDIR /app

COPY bun.lock package.json ./
COPY islanders-client/package.json islanders-client/
COPY islanders-server/package.json islanders-server/
COPY islanders-shared/package.json islanders-shared/
RUN bun install --frozen-lockfile

COPY islanders-shared/lib ./islanders-shared/lib
COPY islanders-client/svelte.config.js ./islanders-client/svelte.config.js
COPY islanders-client/vite.config.ts ./islanders-client/vite.config.ts
COPY islanders-client/tsconfig.json ./islanders-client/tsconfig.json
COPY islanders-client/eslint.config.js ./islanders-client/eslint.config.js
COPY islanders-client/vitest-setup-client.ts ./islanders-client/vitest-setup-client.ts
COPY islanders-client/static ./islanders-client/static
COPY islanders-client/src ./islanders-client/src

WORKDIR /app/islanders-client
RUN bun run build

FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/islanders-client/build ./build
COPY islanders-client/package.json ./package.json

EXPOSE 3000

CMD ["node", "build"]
