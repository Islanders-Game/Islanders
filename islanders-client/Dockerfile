# Library
ARG BRANCH_TAG=latest
ARG LOCAL_REGISTRY=
FROM ${LOCAL_REGISTRY}islanders/islanders-shared:${BRANCH_TAG} as library

# Cache
FROM node:alpine as dependency-cache-client
RUN apk update && apk upgrade && \
    apk add --no-cache bash git openssh python3 make g++
WORKDIR /cache
COPY ./package*.json ./
#     --legacy-peer-deps is needed for Vue 2
RUN npm install --legacy-peer-deps 

# Builder
FROM node:alpine as builder
# Global dependencies
RUN ["npm", "install", "-g", "typescript"]
RUN apk update && apk upgrade && \
    apk add --no-cache bash git openssh python3 make g++

WORKDIR /app
# Copy over library
COPY --from=library /app /app/islanders-shared

# App dependencies
WORKDIR /app/client
COPY --from=dependency-cache-client /cache/node_modules ./node_modules
COPY ./package*.json ./
#     --legacy-peer-deps is needed for Vue 2
RUN npm install --legacy-peer-deps

# Build app
COPY . .
RUN npm run build

# Runtime image
FROM nginx:alpine
COPY default.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/client/dist /usr/share/nginx/html/
