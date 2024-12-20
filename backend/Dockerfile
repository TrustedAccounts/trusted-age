# Stage1: Init Image
FROM node:18-bullseye-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Stage 2: Build the app
RUN npm run build
FROM node:18-bullseye-slim

# Install curl for healthcheck
RUN apt-get update && apt-get install -y curl

WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
#COPY --from=build /app/.env ./
EXPOSE 5555
CMD ["node", "dist/main.js"]