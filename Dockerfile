FROM node:22 AS base

# install anything you need from the base image
# ...

FROM base AS dependencies

WORKDIR /app

COPY package*.json ./

RUN npm install

FROM base AS build

WORKDIR /app

COPY . .
COPY --from=dependencies /app/node_modules ./node_modules

RUN npm run build
RUN npm prune --prod

# use distroless as minimal base image to package the app
FROM gcr.io/distroless/nodejs22-debian12 AS release

# set non-root user
USER 1000 

WORKDIR /app

COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package*.json ./package.json

ENV PORT=3333

EXPOSE 3333

CMD ["dist/infra/http/server.js"]
