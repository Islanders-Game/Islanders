ARG BRANCH_TAG=latest
FROM node:latest
WORKDIR /app

# App dependencies
RUN ["npm", "install", "-g", "typescript"]
COPY package.json ./
COPY .yarnrc.yml ./
COPY .yarn/releases/yarn-berry.cjs ./.yarn/releases/yarn-berry.cjs
RUN ["yarn", "install"]

COPY . /app

RUN ["yarn", "build"]
CMD ["yarn", "test"]
