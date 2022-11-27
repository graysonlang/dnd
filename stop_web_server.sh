#!/usr/bin/env bash

set -euo pipefail

export SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"
pushd "${SCRIPT_DIR}" > /dev/null

source web_server.sh

# Check if the server is running.
if [[ ! -z "${WEB_SERVER_PID}" ]]; then
  kill -9 ${WEB_SERVER_PID}
  echo "Stopped web server (${WEB_SERVER_CMD}) with pid: ${WEB_SERVER_PID}."
else
  echo "Web server (${WEB_SERVER_CMD}) not running."
fi

popd > /dev/null
