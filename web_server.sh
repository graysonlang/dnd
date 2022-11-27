#!/usr/bin/env bash

set -euo pipefail

escape_string_for_regex() {
  echo "$@" | sed -e 's/\(-.\)/\\\1/g'
}

get_server_pid() {
  pgrep -f -u $(whoami) "$(escape_string_for_regex ${WEB_SERVER_CMD})" || echo ""
}

: ${WEB_SERVER_PORT:=80}
WEB_SERVER_CMD="http.server ${WEB_SERVER_PORT}"
WEB_SERVER_PID=$(get_server_pid)
