FROM node:latest
WORKDIR /app

# App dependencies
COPY package.json /app
RUN ["yarn", "install"]

COPY . /app

RUN ["npm", "run", "build"]
CMD ["npm", "run", "test"]