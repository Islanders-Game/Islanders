FROM pilgrims/pilgrims-shared as library

FROM node:alpine
WORKDIR /app
# Copy over library
COPY --from=library /app /app/pilgrims-shared

# App dependencies
WORKDIR /app/server
COPY package.json ./
RUN npm install

# Build app
COPY . .
RUN npm run build

# Run
ENV PORT 3001
EXPOSE 3001
CMD ["node", "start"]
