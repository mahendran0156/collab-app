# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM node:18-slim AS builder

WORKDIR /app

# Copy package files first (better layer caching)
COPY package.json package-lock.json* ./

# Clean install — no optional, no audit
RUN npm ci --no-audit --no-fund

# Copy all source files
COPY . .

# ── Inject env vars at BUILD TIME (required for Vite) ─────────────────────────
ARG VITE_API_URL=https://collab-backend-98o3.onrender.com
ARG VITE_SOCKET_URL=https://collab-backend-98o3.onrender.com
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_SOCKET_URL=$VITE_SOCKET_URL

# Build — if this fails, the error will show in Render logs
RUN npm run build

# ── Stage 2: Serve with Nginx ──────────────────────────────────────────────────
FROM nginx:1.25-alpine AS runner

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy our nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built React app from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
