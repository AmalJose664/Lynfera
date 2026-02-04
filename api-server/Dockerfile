FROM node:18-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: production
FROM node:18-alpine
WORKDIR /app


COPY package*.json ./
ENV NODE_ENV=production
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

EXPOSE 8000
CMD ["npm", "run", "start"]



# # # Build image (replace backend with your image name)
# # docker build -t backend .

# # # Run container
# # docker run -p 5000:5000 backend

