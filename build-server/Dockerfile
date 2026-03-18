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
RUN chmod 700 /app \
 && chmod 700 /root \
 && chmod 711 /home \
 && chmod 755 /bin /usr /lib /lib64 \
 && chmod 711 /

RUN chown -R builder:builder /app

USER builder
COPY package*.json .
RUN npm ci && npm cache clean --force

# RUN mkdir -p /app/output
COPY --chmod=755 main.sh builder.js ./


ENTRYPOINT ["/app/main.sh"]
# CMD ["/bin/bash"]
