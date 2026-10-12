# Battlefront Eternal relay

GPL-3.0-only deployment tooling for the pinned upstream coturn image. Coturn and
its dependencies retain their own licenses. No custom encryption or relay protocol.

`npm test` validates configuration constraints. Build the Dockerfile, then deploy
`docker-compose.portainer.production.yml` through Portainer. Supply an immutable
`APP_IMAGE` and a 64-character hex `TURN_SECRET` shared with the master. The public
IPv4/IPv6 values in Compose are Aldine's addresses.

Listeners: UDP/TCP 3478, TLS TCP 5349, allocations UDP 49160–49415. TCP 80/443
remain with the existing web proxy. TURN over TCP is a client-to-relay fallback;
`no-tcp-relay` disables RFC 6062 peer TCP allocations, not this fallback.
The limit is 160 allocations total and four per temporary username, with
256 KiB/s per session and a 10 MiB/s aggregate configuration cap. The 256-port
allocation pool accommodates 64 fully relayed peers using an allocation at each
end, with room for reconnects. This provisions slots; it does not certify
64-player gameplay performance. The production container may use up to two CPU cores and
1 GiB RAM. These are shared-host ceilings, not reserved capacity; gameplay
qualification still requires load testing the game server and relay together.
Internal and metadata peer destinations are denied. No public admin listener or unauthenticated allocations.

The host certificate sync job publishes only the relay certificate and key into
`/opt/battlefront-eternal/certs/current`, read-only in the container. Run renewal
checks and test the controlled relay restart before production use. Restarting
coturn interrupts current allocations; clients need reconnect support.

Restrictive networks allowing only TCP 443 may not connect. Starlink/CGNAT alone
does not impose that restriction. Verify real UDP/TCP/TLS relay traffic, both IP
families and cross-family paths; an open listener is not a relay acceptance test.
