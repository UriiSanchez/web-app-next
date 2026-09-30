FROM node:22-alpine AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

FROM base AS tooling
RUN apk add --no-cache libc6-compat
COPY package.json ./
# Corepack provisions the pnpm version pinned in packageManager. If the network
# cannot reach registry.npmjs.org, set COREPACK_NPM_REGISTRY (see docs/docker-image.md).
RUN manager="$(node -p "require('./package.json').packageManager")" && \
    case "$manager" in pnpm@*) ;; *) echo 'Expected a pinned pnpm packageManager in package.json' >&2; exit 1 ;; esac && \
    corepack enable && \
    corepack prepare "$manager" --activate && \
    pnpm --version
COPY pnpm-lock.yaml pnpm-workspace.yaml ./

FROM tooling AS deps
RUN pnpm install --frozen-lockfile

FROM deps AS builder
COPY . .
ARG ARG_ACTIVE_ISILOANS=true
ENV NEXT_PUBLIC_ACTIVE_ISILOANS=${ARG_ACTIVE_ISILOANS}
RUN pnpm run build

FROM tooling AS newrelic
# New Relic is externalized and is not included by Next's standalone tracing.
# Reduce the manifest to newrelic and reinstall over the existing lockfile: pnpm
# keeps the locked versions and prunes the rest. The hoisted layout has no
# symlinks, so the resulting node_modules can be copied over the standalone one.
RUN node -e "const fs=require('fs');const p=require('./package.json');p.dependencies={newrelic:p.dependencies.newrelic};delete p.devDependencies;fs.writeFileSync('package.json',JSON.stringify(p))" && \
    pnpm install --prod --no-frozen-lockfile --node-linker=hoisted && \
    rm -rf node_modules/.pnpm node_modules/.modules.yaml node_modules/.pnpm-workspace-state-v1.json

FROM base AS runner
ENV TZ=Etc/GMT+6
ENV NODE_ENV=production
ENV PORT=3001
ENV HOSTNAME=0.0.0.0
RUN addgroup --system --gid 1001 group_easycredit && \
    adduser --system --uid 1001 user_easyfront

COPY --from=builder --chown=user_easyfront:group_easycredit /app/.next/standalone ./
# Overlay only newrelic and its dependencies; no name overlaps the traced modules.
COPY --from=newrelic --chown=user_easyfront:group_easycredit /app/node_modules ./node_modules
COPY --from=builder --chown=user_easyfront:group_easycredit /app/.next/static ./.next/static
COPY --from=builder --chown=user_easyfront:group_easycredit /app/public ./public
COPY --from=builder --chown=user_easyfront:group_easycredit /app/newrelic.js ./newrelic.js

USER user_easyfront
EXPOSE 3001
CMD ["node", "-r", "newrelic", "server.js"]
