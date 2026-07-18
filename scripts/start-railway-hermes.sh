#!/usr/bin/env bash

set -Eeuo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd -- "${SCRIPT_DIR}/.." && pwd)"

HERMES_BIN="${HERMES_BIN:-/opt/hermes/bin/hermes}"
NODE_BIN="${NODE_BIN:-/usr/local/bin/node}"
MINIAPPS_SERVER="${MINIAPPS_SERVER:-${REPO_ROOT}/miniapps/server.mjs}"

if [[ ! -x "${HERMES_BIN}" ]]; then
  echo "Hermes executable not found: ${HERMES_BIN}" >&2
  exit 1
fi

if [[ ! -x "${NODE_BIN}" ]]; then
  echo "Node executable not found: ${NODE_BIN}" >&2
  exit 1
fi

if [[ ! -f "${MINIAPPS_SERVER}" ]]; then
  echo "Mini-app server not found: ${MINIAPPS_SERVER}" >&2
  exit 1
fi

# Keep Telegram focused on the product experience. These writes are
# idempotent and live on Railway's persistent /opt/data volume, while applying
# them on every boot also makes a fresh volume behave correctly.
"${HERMES_BIN}" config set display.platforms.telegram.tool_progress off
"${HERMES_BIN}" config set display.platforms.telegram.busy_ack_detail false
"${HERMES_BIN}" config set display.platforms.telegram.interim_assistant_messages false
"${HERMES_BIN}" config set display.platforms.telegram.long_running_notifications false
"${HERMES_BIN}" config set display.platforms.telegram.cleanup_progress true

"${NODE_BIN}" "${MINIAPPS_SERVER}" &
miniapps_pid=$!

"${HERMES_BIN}" gateway run &
gateway_pid=$!

cleanup() {
  kill "${miniapps_pid}" "${gateway_pid}" 2>/dev/null || true
}

trap cleanup EXIT INT TERM

# If either service exits, stop the other one and let Railway restart the
# container instead of leaving a partially working deployment online.
set +e
wait -n "${miniapps_pid}" "${gateway_pid}"
status=$?
set -e

exit "${status}"
