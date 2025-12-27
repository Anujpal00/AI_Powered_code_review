
FROM node:24-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Upgrade npm to >=11
RUN npm install -g npm@11.7.0

# Install global dev dependencies
RUN npm install -g patch-package

# Install project dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# -------------------------------
# Stage 2: Serve with Nginx
# -------------------------------
FROM nginx:alpine

# Copy built files to Nginx html directory
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
