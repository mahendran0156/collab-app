# ── Stage 1: deps ─────────────────────────────────────────────────────────────
# Use slim (not alpine) to avoid bcrypt/native module build issues
FROM node:18-slim AS deps

WORKDIR /app

# Copy package files first (layer cache — only re-runs npm install if these change)
COPY package.json package-lock.json* ./

# Install production deps only
RUN npm ci --omit=dev


# ── Stage 2: production image ─────────────────────────────────────────────────
FROM node:18-slim AS runner

# Set working directory
WORKDIR /app

# Create a non-root user for security (best practice)
RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 --ingroup nodejs appuser

# Copy installed node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application source
COPY --chown=appuser:nodejs . .

# Switch to non-root user
USER appuser

# Render assigns PORT dynamically — default to 5000 for local
ENV PORT=5000
ENV NODE_ENV=production

# Expose the port (documentation only — Render overrides this)
EXPOSE 5000

# Health check — Render will poll /health to know if app is alive
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:'+process.env.PORT+'/health', r => r.statusCode === 200 ? process.exit(0) : process.exit(1)).on('error', () => process.exit(1))"

# Start the server
CMD ["node", "server.js"]
