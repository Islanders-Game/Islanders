ARG BRANCH_TAG=latest
FROM colonists/colonists-shared:${BRANCH_TAG} as library

FROM node as dependency-cache-server
WORKDIR /cache
COPY package*.json ./
RUN npm install

FROM node
WORKDIR /app
# Copy over library
COPY --from=library /app /app/colonists-shared

# App dependencies
RUN ["npm", "install", "-g", "typescript"]
WORKDIR /app/server
COPY --from=dependency-cache-server /cache/node_modules ./node_modules
COPY package*.json ./
RUN npm install

# Build app
COPY . .
RUN npm run build

# Run
ENV PORT 3000
EXPOSE 3000
CMD ["npm", "run", "start"]
