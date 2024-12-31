# Node.js-based image for Vite
FROM node:18-slim

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the frontend files
COPY . .

# Expose the Vite development server port
EXPOSE 5173

# Run the Vite development server
CMD ["npm", "run", "dev", "--", "--host"]
