ARG BRANCH_TAG=latest
FROM colonists/colonists-shared:${BRANCH_TAG} as library

FROM node:alpine
WORKDIR /app
# Copy over library
COPY --from=library /app /app/colonists-shared

# App dependencies
RUN ["npm", "install", "-g", "typescript"]
WORKDIR /app/server
COPY package.json ./
COPY .yarnrc.yml ./
COPY .yarn/releases/yarn-berry.cjs ./.yarn/releases/yarn-berry.cjs
RUN yarn install

# Build app
COPY . .
RUN yarn build

# Run
ENV PORT 3000
EXPOSE 3000
CMD ["yarn", "start"]
