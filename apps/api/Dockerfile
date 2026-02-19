FROM node:24-alpine AS base
RUN npm install -g pnpm

FROM base AS deps
WORKDIR /app
RUN apk add --no-cache python3 make g++
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/
RUN pnpm install --frozen-lockfile

FROM deps AS build
COPY packages/shared ./packages/shared
RUN apk add --no-cache python3 make g++
COPY apps/api ./apps/api
COPY tsconfig.base.json ./
RUN pnpm --filter @overtime/api build

FROM node:24-alpine AS runner
WORKDIR /app
RUN apk add --no-cache python3 make g++
RUN npm install -g pnpm
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/
RUN pnpm install --prod --frozen-lockfile
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY packages/shared/src ./packages/shared/src

RUN mkdir -p /app/data
EXPOSE 3001
CMD ["node", "apps/api/dist/index.js"]

