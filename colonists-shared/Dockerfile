ARG BRANCH_TAG=latest
FROM node as dependency-cache-shared
WORKDIR /cache
COPY package*.json ./
RUN npm install

FROM node
WORKDIR /app

# App dependencies
RUN ["npm", "install", "-g", "typescript"]

COPY --from=dependency-cache-shared /cache/node_modules ./node_modules
COPY package.json package-lock.json ./
RUN ["npm", "install"]

COPY . /app

RUN ["npm", "run", "build"]
CMD ["npm", "run", "test"]
