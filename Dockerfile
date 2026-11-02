# Stage 0, "build-stage", based on Node.js, to build and compile the frontend
# Node 20 reached end-of-life in April 2026; build on the current LTS line.
FROM node:24-alpine AS build-stage

WORKDIR /app

COPY package.json package-lock.json /app/

# `npm ci` installs exactly what package-lock.json pins (with integrity
# hashes) and fails if package.json and the lockfile disagree.
RUN npm ci --no-audit --no-fund

COPY . /app

ARG VITE_API_URL

RUN npm run build


# Stage 1, based on Nginx, to have only the compiled app, ready for production with Nginx
FROM nginx:1.30-alpine

# Used by nginx/default.conf.template to build the CSP connect-src directive.
ARG VITE_API_URL
ENV API_URL=${VITE_API_URL}

COPY --from=build-stage /app/dist/ /usr/share/nginx/html

COPY ./nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY ./nginx-backend-not-found.conf /etc/nginx/extra-conf.d/backend-not-found.conf
