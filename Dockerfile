FROM node:21-alpine

WORKDIR /app

# Copy dist folder first (already built)
COPY dist/ ./dist/

# Copy package files and install
COPY package*.json ./
RUN npm install --omit=dev

# Copy prisma and remaining files
COPY prisma/ ./prisma/
RUN npx prisma generate

# Copy source for reference (not needed for runtime but included for docker context)
COPY src/ ./src/
COPY tsconfig.json ./
COPY package.json ./

EXPOSE 3001

CMD ["node", "dist/index.js"]
