FROM pilgrims/pilgrims-shared as library

FROM node:alpine
WORKDIR /app
# Copy over library
COPY --from=library /app /app/pilgrims-shared

# App dependencies
WORKDIR /app/server
COPY package.json ./
RUN yarn install

# Build app
COPY . .
RUN npm run build

# Run
ENV PORT 3000
EXPOSE 3000
CMD ["npm", "run", "start"]
