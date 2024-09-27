# If you are building it for ARM arch
# FROM arm64v8/node:20-slim as runtime
FROM node:20-slim

WORKDIR /app
# Make sure the app does not run as root
RUN chown nobody /app

COPY . .

RUN npm install pnpm -g \
  && pnpm install

USER nobody

# Start from the Remix build which already includes our Express server
CMD ["pnpm", "start"]