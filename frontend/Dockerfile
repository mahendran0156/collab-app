# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM node:18-slim AS builder

WORKDIR /app

# Copy package files first (layer cache)
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source
COPY . .

# Build args so VITE_ vars are available at build time
ARG VITE_API_URL
ARG VITE_SOCKET_URL
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_SOCKET_URL=$VITE_SOCKET_URL

# Build the app
RUN npm run build

# ── Stage 2: Serve with Nginx ─────────────────────────────────────────────────
FROM nginx:alpine AS runner

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]