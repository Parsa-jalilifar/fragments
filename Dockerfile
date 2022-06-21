# Dockerfile for fragments API

# Stage 0: Install alpine Linux + node + ci + dependencies
FROM node:16.15.1-alpine3.15@sha256:1fafca8cf41faf035192f5df1a5387656898bec6ac2f92f011d051ac2344f5c9 AS dependencies

# LABEL adds metadata to an image
LABEL maintainer="Parsa Jalilifar <pjalilifar@myseneca.ca>"   
LABEL description="Fragments node.js microservice"

# Image and container will run in production mode
ENV NODE_ENV=production

# We default to use port 8080 in our service
ENV PORT=8080

# Reduce npm spam when installing within Docker
# https://docs.npmjs.com/cli/v8/using-npm/config#loglevel
ENV NPM_CONFIG_LOGLEVEL=warn

# Disable colour when run inside Docker
# https://docs.npmjs.com/cli/v8/using-npm/config#color
ENV NPM_CONFIG_COLOR=false

# Use /app as our working directory
WORKDIR /app

# Copy the package.json and package-lock.json files into /app
COPY package*.json ./

# Install only production dependencies defined in package-lock.json
RUN npm ci --only=production

#######################################################################

# Stage 1: use dependencies to run the API server

FROM node:16.15.1-alpine3.15@sha256:1fafca8cf41faf035192f5df1a5387656898bec6ac2f92f011d051ac2344f5c9 AS deploy

# Install dumb-init and curl
RUN apk add --no-cache dumb-init=~1.2.5  \
  && apk add --no-cache curl=~7.80.0

# Image and container will run in production mode
ENV NODE_ENV=production

# Use /app as our working directory
WORKDIR /app

# Copy cached dependencies from stage 0 to stage 1 so we don't have to download them again
# --chown=node:node means change owenrship to node user
COPY --chown=node:node --from=dependencies /app /app/

# Copy src to /app/src/
COPY --chown=node:node ./src ./src

# Copy our HTPASSWD file
COPY --chown=node:node ./tests/.htpasswd ./tests/.htpasswd

# Change user from root to node
USER node

# Start the container by running our server
CMD ["dumb-init", "node", "src/index.js"]

# We run our service on port 8080
EXPOSE 8080

# Healthcheck
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD curl --fail localhost:8080 || exit 1
