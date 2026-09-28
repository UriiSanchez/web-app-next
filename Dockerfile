FROM node:22-alpine AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

FROM base AS tooling
RUN apk add --no-cache libc6-compat
COPY package.json ./
# npm only bootstraps the pinned manager; application dependencies use pnpm.
RUN npm install --global "$(node -p "require('./package.json').packageManager")" --ignore-scripts
COPY pnpm-lock.yaml pnpm-workspace.yaml ./

FROM tooling AS deps
RUN pnpm install --frozen-lockfile

FROM deps AS builder
COPY . .
ARG ARG_ACTIVE_ISILOANS=true
ENV NEXT_PUBLIC_ACTIVE_ISILOANS=${ARG_ACTIVE_ISILOANS}
RUN pnpm run build

FROM tooling AS production-deps
# New Relic is externalized and is not included by Next's standalone tracing.
# Copy the complete production graph so pnpm's symlinks remain valid.
RUN pnpm install --prod --frozen-lockfile

FROM base AS runner
ENV TZ=Etc/GMT+6
ENV NODE_ENV=production
ENV NEXT_SHARP_PATH=/app/node_modules/sharp
ENV PORT=3001
ENV HOSTNAME=0.0.0.0
RUN addgroup --system --gid 1001 group_easycredit && \
    adduser --system --uid 1001 user_easyfront

COPY --from=builder --chown=user_easyfront:group_easycredit /app/.next/standalone ./
COPY --from=production-deps --chown=user_easyfront:group_easycredit /app/node_modules ./node_modules
COPY --from=builder --chown=user_easyfront:group_easycredit /app/.next/static ./.next/static
COPY --from=builder --chown=user_easyfront:group_easycredit /app/public ./public
COPY --from=builder --chown=user_easyfront:group_easycredit /app/newrelic.js ./newrelic.js

USER user_easyfront
EXPOSE 3001
CMD ["node", "-r", "newrelic", "server.js"]
