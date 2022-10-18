##* build-runner
FROM node:lts-alpine as build-runner

# Set temp directory
WORKDIR /tmp/app

# Move package.json
COPY package.json .

# Install dependencies
RUN npm install

# Move source files
COPY src ./src
COPY tsconfig.json   .

# generate prisma client
RUN npx prisma generate --schema /tmp/app/src/prisma/schema.prisma

# Build project
RUN npm run build

CMD [ "npm", "run", "start" ]


##* prod-runner
FROM node:lts-alpine as prod-runner

# Set work directory
WORKDIR /app

# Copy package.json from build-runner
COPY --from=build-runner /tmp/app/package.json /app/package.json

# Install dependencies
RUN npm install --only=production

# expose the port 
EXPOSE 3300

# Move build files
COPY --from=build-runner /tmp/app/build /app/build
COPY --from=build-runner /tmp/app/src/prisma /app/build/prisma

# generate prisma client
RUN npx prisma generate --schema /app/build/prisma/schema.prisma

# Start bot
CMD [ "npm", "run", "start" ]


# ##* Dockerfile
# FROM node:lts-alpine as prod-runner
# # Set work directory
# WORKDIR /app
#  # Move package.json
# COPY package.json .
# # # Install dependencies
# RUN npm install --only=production
# # # Move source files
# COPY src ./src
# COPY tsconfig.json   .
# # # Build project
# RUN npm run build
# # expose the port 
# EXPOSE 3300
# # # Start bot
# CMD [ "npm", "run", "start" ]