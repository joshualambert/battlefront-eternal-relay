FROM coturn/coturn:4.18.0-r0@sha256:bbefd3e1fdfdc0d58770fe01b581fd8b00d9f3a5580d00acb77cf719a6bc78e3
USER root
RUN apt-get update && apt-get install -y --no-install-recommends nodejs && rm -rf /var/lib/apt/lists/* && mkdir -p /run/bfe && chown 1000:1000 /run/bfe
COPY scripts/render-config.mjs /app/render-config.mjs
COPY scripts/entrypoint.sh /app/entrypoint.sh
USER 1000:1000
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s CMD node -e "const n=require('net');const s=n.connect(5349,process.env.PUBLIC_IPV4,()=>{s.end();process.exit(0)});s.on('error',()=>process.exit(1));setTimeout(()=>process.exit(1),3000)"
ENTRYPOINT ["/app/entrypoint.sh"]
CMD []
