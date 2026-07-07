# Stage 0: Build the frontend
FROM node:20-alpine AS build-stage

WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy package files first for better caching
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Install dependencies using pnpm
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build argument for API URL - empty string for relative path (nginx proxy)
ARG VITE_API_URL=
ENV VITE_API_URL=$VITE_API_URL

# Build the app
RUN pnpm build

# Stage 1: Serve with Nginx
FROM nginx:1-alpine

# Copy built files
COPY --from=build-stage /app/dist/ /usr/share/nginx/html

# Copy nginx config as a template (nginx image handles envsubst)
COPY ./nginx.conf /etc/nginx/templates/default.conf.template

# Expose port (Railway sets PORT env var dynamically)
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]