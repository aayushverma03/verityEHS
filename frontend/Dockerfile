# Frontend Dockerfile for EHS AI Platform
FROM node:20-alpine

WORKDIR /app

# Install curl for healthcheck
RUN apk add --no-cache curl

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy application code
COPY . .

# Build for production
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
