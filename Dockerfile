FROM node:21-alpine

WORKDIR /app

# Copy package files and install dependencies only
COPY package*.json ./
RUN npm install --omit=dev

# Copy dist (already built and committed)
COPY dist/ ./dist/

# Copy prisma schema and generate client
COPY prisma/ ./prisma/
RUN npx prisma generate

EXPOSE 3001

CMD ["node", "dist/index.js"]
