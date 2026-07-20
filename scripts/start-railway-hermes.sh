#!/usr/bin/env bash

set -Eeuo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd -- "${SCRIPT_DIR}/.." && pwd)"

HERMES_BIN="${HERMES_BIN:-/opt/hermes/bin/hermes}"
NODE_BIN="${NODE_BIN:-/usr/local/bin/node}"
MINIAPPS_SERVER="${MINIAPPS_SERVER:-${REPO_ROOT}/miniapps/server.mjs}"
export MINIAPPS_ROOT="${MINIAPPS_ROOT:-${REPO_ROOT}/generated-apps}"

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

# Keep chat channels focused on the product experience. Set global fallbacks for
# Hermes versions that do not consistently apply per-platform overrides, then
# keep explicit channel settings for versions that do. These writes are
# idempotent and live on Railway's persistent /opt/data volume, while applying
# them on every boot also makes a fresh volume behave correctly.
"${HERMES_BIN}" config set display.tool_progress off
"${HERMES_BIN}" config set display.interim_assistant_messages false
"${HERMES_BIN}" config set display.show_commentary false

for platform in telegram discord; do
  "${HERMES_BIN}" config set "display.platforms.${platform}.tool_progress" off
  "${HERMES_BIN}" config set "display.platforms.${platform}.busy_ack_detail" false
  "${HERMES_BIN}" config set "display.platforms.${platform}.interim_assistant_messages" false
  "${HERMES_BIN}" config set "display.platforms.${platform}.long_running_notifications" false
  "${HERMES_BIN}" config set "display.platforms.${platform}.cleanup_progress" true
done

# Discord stays closed by default even if a bot token is later attached. The
# deployment supplies allowlisted user and channel IDs as Railway secrets.
export DISCORD_ALLOW_ALL_USERS="${DISCORD_ALLOW_ALL_USERS:-false}"
export DISCORD_REQUIRE_MENTION="${DISCORD_REQUIRE_MENTION:-true}"
export DISCORD_IGNORE_NO_MENTION="${DISCORD_IGNORE_NO_MENTION:-true}"
export DISCORD_ALLOW_BOTS="${DISCORD_ALLOW_BOTS:-none}"
export DISCORD_AUTO_THREAD="${DISCORD_AUTO_THREAD:-true}"
# Reactions provide a quiet, immediate receipt without restoring verbose tool updates.
export DISCORD_REACTIONS="${DISCORD_REACTIONS:-true}"

if [[ -z "${DISCORD_ALLOWED_USERS:-}" && -z "${DISCORD_ALLOWED_ROLES:-}" ]]; then
  echo "Warning: Discord has no allowed users or roles; user requests may be denied." >&2
fi
if [[ -z "${DISCORD_ALLOWED_CHANNELS:-}" ]]; then
  echo "Warning: Discord has no allowed channels configured." >&2
fi

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
