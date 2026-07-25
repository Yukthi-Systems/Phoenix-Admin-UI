# Stage 1: Build the application
FROM node:22-alpine AS builder

# Set the working directory for the build stage
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Configure npm for network resilience
RUN npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000

# Install dependencies
RUN npm install

# Copy the application source code into the container
COPY . .

# Build the application
RUN npm run build

# Stage 2: Create the final image
FROM node:22-alpine

# Set the working directory within the container
WORKDIR /app

# Install 'serve' to serve the built application
RUN npm install -g serve

# Install wget (needed for health check)
RUN apk add --no-cache wget

# Copy the built application files from the builder stage
COPY --from=builder /app/dist /app/dist

# --- NEW STEPS START ---
# Copy the shell script
COPY env.sh /app/env.sh

# Make sure it's executable
RUN chmod +x /app/env.sh
# --- NEW STEPS END ---

# Expose port 3000 for the web server
EXPOSE 3000

# Health check command
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --quiet --tries=1 --spider http://localhost:3000 || exit 1

# Use the shell script as the entrypoint wrapper
ENTRYPOINT ["/app/env.sh"]

# Start the application using 'serve' (passed to ENTRYPOINT)
CMD ["serve", "-s", "dist", "-l", "3000"]