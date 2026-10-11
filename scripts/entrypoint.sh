#!/bin/sh
set -eu
umask 077
node /app/render-config.mjs /run/bfe/turnserver.conf
exec turnserver -c /run/bfe/turnserver.conf
