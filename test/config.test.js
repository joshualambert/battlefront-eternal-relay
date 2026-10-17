import { test } from "node:test";
import assert from "node:assert/strict";
import { config } from "../scripts/render-config.mjs";
test("bounded authenticated dual-stack TURN without port 443", () => {
  const s = config({
    TURN_SECRET: "a".repeat(64),
    PUBLIC_IPV4: "139.144.48.72",
    PUBLIC_IPV6: "2600:3c02::2000:34ff:fe00:7583",
  });
  for (const line of [
    "use-auth-secret",
    "tls-listening-port=5349",
    "total-quota=160",
    "min-port=49160",
    "max-port=49415",
    "denied-peer-ip=127.0.0.0-127.255.255.255",
  ])
    assert.ok(s.includes(line));
  assert.ok(!s.includes("listening-port=443"));
  const value = key => Number(s.match(new RegExp(`^${key}=(\\d+)$`, 'm'))[1]);
  assert.ok(value('total-quota') >= 64 * 2, '64 fully relayed peers may need an allocation at each end');
  assert.ok(value('max-port') - value('min-port') + 1 >= value('total-quota'), 'port pool must cover the allocation quota');
  // coturn drops a session's traffic above max-bps, and reserves max-bps per
  // allocation from bps-capacity, refusing new ones (486) once it is spent.
  // A player of a full 64-player battle receives about 2.9 Mbit/s.
  assert.ok(value('max-bps') * 8 >= 8 * 1000 * 1000, 'each relayed player may use at least 8 Mbit/s per direction');
  assert.ok(value('bps-capacity') >= value('total-quota') * value('max-bps'), 'the allocation quota, not bandwidth, limits relayed sessions');
  assert.ok(value('bps-capacity') < 2 ** 32, 'coturn holds bandwidth in 32 bits');
});
test("config injection and missing secrets rejected", () => {
  assert.throws(() => config({}));
  assert.throws(() =>
    config({
      TURN_SECRET: "a".repeat(64),
      PUBLIC_IPV4: "1.2.3.4\nno-auth",
      PUBLIC_IPV6: "::1",
    }),
  );
});

test("never configure the unspecified address as a wildcard deny range", () => {
  const s = config({
    TURN_SECRET: "a".repeat(64),
    PUBLIC_IPV4: "139.144.48.72",
    PUBLIC_IPV6: "2600:3c02::2000:34ff:fe00:7583",
  });
  assert.ok(!s.split("\n").includes("denied-peer-ip=::"));
});

test("disabled-by-default listeners are not enabled", () => { const s = config({TURN_SECRET:"a".repeat(64),PUBLIC_IPV4:"139.144.48.72",PUBLIC_IPV6:"2600:3c02::2000:34ff:fe00:7583"}); assert.ok(!s.split("\n").includes("cli")); assert.ok(!s.split("\n").includes("dtls")); });
