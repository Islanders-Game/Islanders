FROM node:alpine

# Global dependencies
RUN npm install -g tsc \
    && npm install -g typescript

# App dependencies
COPY package.json ./
RUN npm install

# Build app
COPY . .
RUN npm run build

# Run
ENV PORT 3001
EXPOSE 3001
CMD ["node", "dist/"]
