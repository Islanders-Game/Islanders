ARG BRANCH_TAG=latest
FROM node:latest
WORKDIR /app

# App dependencies
COPY package.json /app
RUN ["yarn", "install"]

COPY . /app

RUN ["yarn", "build"]
CMD ["yarn", "run", "test"]