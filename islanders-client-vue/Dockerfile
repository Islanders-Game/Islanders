FROM oven/bun:1 AS builder

WORKDIR /app

COPY bun.lock package.json ./
COPY islanders-client/package.json islanders-client/
COPY islanders-server/package.json islanders-server/
COPY islanders-shared/package.json islanders-shared/
RUN bun install --frozen-lockfile

COPY islanders-shared/lib ./islanders-shared/lib
COPY islanders-client/babel.config.js ./islanders-client/babel.config.js
COPY islanders-client/postcss.config.js ./islanders-client/postcss.config.js
COPY islanders-client/tsconfig.json ./islanders-client/tsconfig.json
COPY islanders-client/vue.config.ts ./islanders-client/vue.config.ts
COPY islanders-client/.browserslistrc ./islanders-client/.browserslistrc
COPY islanders-client/public ./islanders-client/public
COPY islanders-client/src ./islanders-client/src

WORKDIR /app/islanders-client
RUN bun run build

FROM nginx:alpine

COPY islanders-client/default.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/islanders-client/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
