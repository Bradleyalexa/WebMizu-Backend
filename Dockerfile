#file: Dockerfile
FROM node:22-alpine AS builder

WORKDIR /app

# Copy configuration files
COPY package*.json tsconfig.json ./

# Install dependencies
RUN npm ci

# Copy source code and packages
COPY packages ./packages
COPY src ./src

# Build the application
RUN npm run build

# Production stage
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy built artifacts and dependencies
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

# Expose port (default 3000 as per config)
EXPOSE 3000

CMD ["npm", "run", "start"]
