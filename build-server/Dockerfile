FROM node:22-bookworm


RUN apt-get update && apt-get remove -y \
    man-db \
    manpages \
    wget \
    curl \
    && apt-get autoremove -y \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* \
    /var/cache/apt/archives/* \
    /usr/share/doc/* \
    /usr/share/man/* \
    /usr/share/info/* \
    /usr/share/locale/* \
    /usr/share/groff/* \
    /usr/share/lintian/* \
    /usr/share/linda/* \
    /usr/share/doc-base/* \
    /usr/share/pixmaps/* \
    /usr/share/common-licenses/* \
    /usr/share/bash-completion/* \
    /usr/share/zsh/* \
    /tmp/* \
    /var/tmp/* \
    /var/log/* \
    /root/.cache


RUN groupadd builder \
 && useradd -m -g builder -s /bin/bash builder
WORKDIR /app
RUN chown -R builder:builder /app

USER builder
COPY package*.json .
RUN npm ci && npm cache clean --force


COPY --chmod=755 main.sh script.js ./


ENTRYPOINT ["/home/app/main.sh"]

