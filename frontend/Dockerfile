# Frontend Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Expose port
EXPOSE 3001

# Start development server on port 3001
CMD ["npm", "run", "dev", "--", "-p", "3001"]
