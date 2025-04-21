# 1단계: Build
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# 2단계: Production server
FROM node:18-alpine

WORKDIR /app
COPY --from=builder /app .

ENV NODE_ENV=production

EXPOSE 3000
CMD ["npm", "start"]