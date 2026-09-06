FROM node:22-slim

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

# Cloud Run injects PORT as an environment variable
ENV PORT=8080
EXPOSE 8080

CMD ["node", "src/index.js"]
