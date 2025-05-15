# Use official Node.js image with Debian
FROM node:18-bullseye

# Install Python 3.10 and pip
RUN apt-get update && apt-get install -y python3.10 python3-pip \
    && ln -sf /usr/bin/python3.10 /usr/bin/python3

# Upgrade pip and install yt-dlp
RUN pip3 install --upgrade pip yt-dlp

# Create app directory
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy all other source files
COPY . .

# Expose the port (if you use Express or HTTP server)
EXPOSE 3000

# Run the bot
CMD ["node", "index.js"]
