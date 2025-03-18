FROM node:18-slim

# Install required dependencies
RUN apt-get update && apt-get install -y \
    pandoc \
    texlive-xetex \
    texlive-fonts-recommended \
    texlive-plain-generic \
    fonts-noto \
    chromium \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Install markdown-pdf and other Node.js dependencies
WORKDIR /app
COPY package.json ./
RUN npm install

# Copy the conversion script
COPY convert.js ./

# Set entrypoint
ENTRYPOINT ["node", "/app/convert.js"]