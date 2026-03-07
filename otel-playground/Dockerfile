# Build stage
FROM node:22-slim AS build
WORKDIR /app

RUN npm install -g bun

COPY package.json bun.lock ./
COPY apps/ apps/
COPY libs/ libs/
COPY tsconfig.base.json ./

RUN bun install --frozen-lockfile

ARG APP_NAME
RUN cd apps/${APP_NAME} && bunx nest build

# Runtime stage
FROM node:22-slim

ARG APP_NAME
ENV APP_NAME=${APP_NAME}
WORKDIR /app

# npm workspaces split deps between root and app-level node_modules.
# NODE_PATH ensures the runtime can find packages in both locations.
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/${APP_NAME}/node_modules ./apps/${APP_NAME}/node_modules
COPY --from=build /app/apps/${APP_NAME}/dist ./dist

ENV NODE_ENV=production
ENV NODE_PATH=/app/node_modules:/app/apps/${APP_NAME}/node_modules

# tsconfig-paths needs a tsconfig to resolve aliases against the compiled output.
# nest build (tsc) infers rootDir as workspace root, so compiled paths are:
#   dist/apps/<name>/src/  and  dist/libs/shared/src/
# Setting baseUrl to "dist" makes the original path patterns resolve correctly.
RUN printf '{"compilerOptions":{"baseUrl":"dist","paths":{"@shared/*":["libs/shared/src/*"],"@app/*":["apps/%s/src/*"]}}}' "$APP_NAME" > tsconfig.json

CMD ["sh", "-c", "node -r tsconfig-paths/register dist/apps/${APP_NAME}/src/main.js"]
