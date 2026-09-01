# ==============================================================================
# HealthChain Enterprise Production Container for Google Cloud Run
# ==============================================================================

FROM node:20-alpine AS runner

# Create application directory
WORKDIR /app

# Set production environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Install dependencies
COPY package*.json ./
RUN npm install --omit=dev --no-audit --no-fund

# Copy backend and application files
COPY . .

# Expose standard Cloud Run port
EXPOSE 8080

# Run production server binding to 0.0.0.0:$PORT
CMD ["npm", "start"]
