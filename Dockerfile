ARG NEXT_MODE

# Use the official Node.js image as a base
FROM node:18-alpine AS build

# Set the working directory
WORKDIR /app

# Copy the package.json and yarn.lock files
COPY package.json yarn.lock ./

# Install dependencies, Next.js version 13.4, and build the app if in production mode
RUN if [ "$NEXT_MODE" = "production" ] ; then yarn install --production && yarn add next@13.4.4 && yarn next build ; else yarn install ; fi

# Copy the rest of the app files
COPY . .

# Use a distroless Node.js image as the final image
FROM node:18-alpine

# Copy the necessary files and dependencies from the build stage
COPY --from=build /app /app 
COPY --from=build /usr/local/lib/node_modules /usr/local/lib/node_modules

WORKDIR /app

# Expose port 3000
EXPOSE 3000

# Set the environment variable for Next.js mode
ENV NEXT_MODE=${NEXT_MODE:-production}

# Start the app
CMD if [ "$NEXT_MODE" = "production" ] ; then node_modules/next/dist/bin/next build && node node_modules/next/dist/bin/next start ; else node node_modules/next/dist/bin/next dev ; fi
