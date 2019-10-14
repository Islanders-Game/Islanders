# Library
ARG BRANCH_TAG=latest
FROM pilgrims/pilgrims-shared:${BRANCH_TAG} as library

# Builder
FROM node:alpine as builder
# Global dependencies
RUN apk update && apk upgrade && \
    apk add --no-cache bash git openssh

WORKDIR /app
# Copy over library
COPY --from=library /app /app/pilgrims-shared

# App dependencies
WORKDIR /app/client

# Install Dependencies
COPY ./package*.json ./
RUN yarn install

# Build app
COPY . .
RUN yarn build

# Runtime image
FROM nginx:alpine
COPY default.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/client/dist /usr/share/nginx/html/
