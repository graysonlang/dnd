#!/usr/bin/env bash

set -euo pipefail

export SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"
pushd "${SCRIPT_DIR}" > /dev/null

source web_server.sh

# Check if the server is not running.
if [[ -z "${WEB_SERVER_PID}" ]]; then
  # Start localhost Python web server in the background.
  DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"
  OUTPUT_TO_FILE=">~/Desktop/http_server_log.txt 2>&1"
  OUTPUT_TO_NULL='>/dev/null 2>&1'
  command="nohup python3 -m ${WEB_SERVER_CMD} -d \"${DIR}\" ${OUTPUT_TO_NULL} &"
  eval ${command}
  echo "Started web server (${WEB_SERVER_CMD}) with pid: $(get_server_pid)."
else
  echo "Web server (${WEB_SERVER_CMD}) already running with pid: ${WEB_SERVER_PID}."
fi

open http://localhost

popd > /dev/null
