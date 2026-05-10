FROM node:18-slim

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Use npm ci with exact lock file - much more reliable than npm install
# --omit=dev skips devDependencies (nodemon not needed in container)
RUN npm ci --omit=dev

# Copy source code
COPY . .

# Create uploads directory
RUN mkdir -p uploads

EXPOSE 5000
CMD ["node", "server.js"]
