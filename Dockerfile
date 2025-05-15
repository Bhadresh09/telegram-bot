FROM debian:bullseye

# Install Node.js 18.x
RUN apt-get update && \
    apt-get install -y curl gnupg python3 python3-pip ffmpeg && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    pip3 install --upgrade yt-dlp && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Set work directory
WORKDIR /app

# Copy files
COPY . .

# Install Node.js dependencies
RUN npm install

# Start the server and bot
CMD ["npm", "start"]
