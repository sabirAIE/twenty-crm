# ===========================================================================
# Standalone Twenty Frontend Dockerfile
# Build context: repository root
# Usage:
#   docker build -f packages/twenty-docker/twenty-front/Dockerfile -t twenty-front .
# ===========================================================================

FROM node:24.19.0-alpine3.23@sha256:244cc2b53f46f9e876304391d17682b0ddae9ac33491f4857e25e35a36ba7995 AS front-deps

WORKDIR /app

COPY ./package.json ./yarn.lock ./.yarnrc.yml ./tsconfig.base.json ./nx.json /app/
COPY ./.yarn/releases /app/.yarn/releases
COPY ./.yarn/patches /app/.yarn/patches

COPY ./packages/twenty-ui/package.json /app/packages/twenty-ui/
COPY ./packages/twenty-shared/package.json /app/packages/twenty-shared/
COPY ./packages/twenty-front/package.json /app/packages/twenty-front/
COPY ./packages/twenty-front-component-renderer/package.json /app/packages/twenty-front-component-renderer/
COPY ./packages/twenty-sdk/package.json /app/packages/twenty-sdk/
COPY ./packages/twenty-client-sdk/package.json /app/packages/twenty-client-sdk/

RUN yarn workspaces focus twenty-monorepo twenty-front twenty-front-component-renderer twenty-ui twenty-shared twenty-sdk twenty-client-sdk && yarn cache clean && npx nx reset

FROM front-deps AS twenty-front-build

COPY ./packages/twenty-front /app/packages/twenty-front
COPY ./packages/twenty-front-component-renderer /app/packages/twenty-front-component-renderer
COPY ./packages/twenty-ui /app/packages/twenty-ui
COPY ./packages/twenty-shared /app/packages/twenty-shared
COPY ./packages/twenty-sdk /app/packages/twenty-sdk
COPY ./packages/twenty-client-sdk /app/packages/twenty-client-sdk

RUN npx nx run twenty-front:lingui:extract && \
    npx nx run twenty-front:lingui:compile

# To skip the memory-intensive frontend build, pre-build on the host:
#   npx nx build twenty-front
# The check below will use packages/twenty-front/build/ if it already exists.
RUN if [ -d /app/packages/twenty-front/build ]; then \
      echo "Using pre-built frontend from host"; \
    else \
      NODE_OPTIONS="--max-old-space-size=8192" npx nx build twenty-front; \
    fi

FROM nginx:alpine AS twenty-front

COPY --from=twenty-front-build /app/packages/twenty-front/build /usr/share/nginx/html
COPY ./packages/twenty-docker/twenty-front/nginx.conf.template /etc/nginx/templates/default.conf.template
COPY ./packages/twenty-docker/twenty-front/inject-env.sh /docker-entrypoint.d/40-inject-env.sh

RUN chmod +x /docker-entrypoint.d/40-inject-env.sh

ENV BACKEND_URL=http://host.docker.internal:3000 \
    PORT=3000 \
    NGINX_ENVSUBST_FILTER="BACKEND_URL|PORT"

EXPOSE 3000

HEALTHCHECK --interval=5s --timeout=5s --retries=10 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/healthz || exit 1

LABEL org.opencontainers.image.description="Twenty standalone frontend image."
