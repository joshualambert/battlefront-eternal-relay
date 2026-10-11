import { writeFileSync } from "node:fs";
export function config(env) {
  const secret = env.TURN_SECRET;
  if (!/^[a-f0-9]{64}$/.test(secret ?? ""))
    throw Error("TURN_SECRET must be 32 random bytes encoded as hex");
  for (const name of ["PUBLIC_IPV4", "PUBLIC_IPV6"])
    if (!/^[a-fA-F0-9:.]+$/.test(env[name] ?? ""))
      throw Error("invalid " + name);
  return `listening-port=3478
tls-listening-port=5349
listening-ip=${env.PUBLIC_IPV4}
listening-ip=${env.PUBLIC_IPV6}
relay-ip=${env.PUBLIC_IPV4}
relay-ip=${env.PUBLIC_IPV6}
realm=relay.battlefronteternal.com
server-name=relay.battlefronteternal.com
fingerprint
use-auth-secret
static-auth-secret=${secret}
min-port=49160
max-port=49259
user-quota=4
total-quota=80
max-bps=262144
bps-capacity=10485760
stale-nonce=600
no-tcp-relay
no-multicast-peers
no-rfc5780
no-software-attribute
cert=/certs/current/fullchain.pem
pkey=/certs/current/privkey.pem
log-file=stdout
simple-log
pidfile=/run/bfe/turnserver.pid
# Block internal destinations without blocking real public game hosts.
denied-peer-ip=0.0.0.0-0.255.255.255
denied-peer-ip=10.0.0.0-10.255.255.255
denied-peer-ip=100.64.0.0-100.127.255.255
denied-peer-ip=127.0.0.0-127.255.255.255
denied-peer-ip=169.254.0.0-169.254.255.255
denied-peer-ip=172.16.0.0-172.31.255.255
denied-peer-ip=192.168.0.0-192.168.255.255
denied-peer-ip=224.0.0.0-255.255.255.255
denied-peer-ip=::1
denied-peer-ip=::ffff:0:0-::ffff:ffff:ffff
denied-peer-ip=fc00::-fdff:ffff:ffff:ffff:ffff:ffff:ffff:ffff
denied-peer-ip=fe80::-febf:ffff:ffff:ffff:ffff:ffff:ffff:ffff
denied-peer-ip=ff00::-ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff
`;
}
if (process.argv[1]?.endsWith("render-config.mjs"))
  writeFileSync(
    process.argv[2] ?? "/run/bfe/turnserver.conf",
    config(process.env),
    { mode: 0o600 },
  );
