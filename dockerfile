FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine
WORKDIR /app
RUN addgroup -g 1001 -S oracle && \
    adduser -S oracle -u 1001
COPY --from=builder /app/node_modules ./node_modules
COPY --chown=oracle:oracle . .
USER oracle
EXPOSE 3000
CMD ["node", "app.js"]