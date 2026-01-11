FROM node:22-slim


RUN apt-get update && \
    apt-get install -y git && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /home/app
COPY package*.json .
RUN npm install 
# RUN npm ci && npm cache clean --force
COPY main.sh main.sh
COPY script.js script.js

COPY --chmod=755 main.sh script.js ./


ENTRYPOINT ["/home/app/main.sh"]

