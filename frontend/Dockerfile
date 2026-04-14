# Frontend Dockerfile

# --- Build stage ---
FROM node:18-alpine AS builder
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code and build
COPY . .
RUN npm run build

# --- Production stage ---
FROM node:18-alpine
WORKDIR /app

# Copy built files and dependencies from builder
COPY --from=builder /app .

# Expose port for production
EXPOSE 3001

# Use production start command
CMD ["npm", "start"]
