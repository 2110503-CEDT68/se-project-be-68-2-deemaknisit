FROM node:24-alpine AS production

WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev && npm cache clean --force

# Copy application source
COPY . .

# Environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Expose the correct port
EXPOSE 5000

# Run as non-privileged user for security
USER node

# Healthcheck to ensure the container is running correctly
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "const net=require('net');const p=process.env.PORT||5000;const s=net.connect(p,'127.0.0.1');s.on('connect',()=>{s.end();process.exit(0)});s.on('error',()=>process.exit(1));setTimeout(()=>process.exit(1),4000);"

# Start the application
CMD ["npm", "start"]
