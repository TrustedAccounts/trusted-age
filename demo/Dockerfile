# Use an official Node.js runtime as a parent image (Node.js 22)
FROM node:22-alpine

# Create and set the working directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Add a non-root user
RUN adduser -S ory -D -u 10000 -s /bin/nologin

# Copy package.json and package-lock.json
COPY package.json package.json
COPY package-lock.json package-lock.json

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . /usr/src/app

# Switch to non-root user
USER 10000

# Define the default command to run the application
ENTRYPOINT npm start

# Expose port 4000
EXPOSE 4000