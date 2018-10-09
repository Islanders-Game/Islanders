FROM node:alpine as builder

WORKDIR /app

# Install Dependencies
COPY ./package*.json ./
RUN npm install

# Build app
COPY . .
RUN npm run build

FROM nginx:alpine
COPY default.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html/
