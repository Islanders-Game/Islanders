FROM oven/bun:1

WORKDIR /app

COPY bun.lock package.json ./
COPY islanders-client/package.json islanders-client/
COPY islanders-shared/package.json islanders-shared/
COPY islanders-server/package.json islanders-server/
RUN bun install --production --frozen-lockfile

COPY islanders-shared/lib ./islanders-shared/lib
COPY islanders-shared/tsconfig.json ./islanders-shared/tsconfig.json
COPY islanders-server/src ./islanders-server/src
COPY islanders-server/public ./islanders-server/public
COPY islanders-server/scripts ./islanders-server/scripts
COPY islanders-server/tsconfig.json ./islanders-server/tsconfig.json

WORKDIR /app/islanders-server

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["bun", "run", "start"]
