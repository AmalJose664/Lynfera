#!/bin/sh
# =============================================================================
# main.sh — Build server container entrypoint
#
# This script is the CMD entrypoint for the build server Docker container.
# Its responsibilities are:
#
#   1. Load environment variables from the .env file injected by the API server.
#   2. Extract sensitive credentials into local shell variables.
#   3. Immediately unset those credentials from the environment so they are
#      not visible to child processes via /proc/<pid>/environ.
#   4. Pass the credentials to builder.js via stdin (printf pipe) rather than
#      environment variables, providing an additional layer of isolation.
#
# Credential order passed to builder.js via stdin (must match cleanEnv() in
# builder.js):
#   Line 1: CONTAINER_API_TOKEN
#   Line 2: CLOUD_ACCESSKEY
#   Line 3: CLOUD_SECRETKEY
#   Line 4: CLOUD_ENDPOINT
#   Line 5: KAFKA_USERNAME
#   Line 6: KAFKA_PASSWORD
#
# The .env file is expected to be present at /app/.env inside the container,
# mounted or written by the API server before the container starts.
# =============================================================================

export $(cat ./.env | xargs)
token="${CONTAINER_API_TOKEN}"
unset CONTAINER_API_TOKEN  # Remove from env immediately after capture

akey="${CLOUD_ACCESSKEY}"
unset CLOUD_ACCESSKEY
skey="${CLOUD_SECRETKEY}"
unset CLOUD_SECRETKEY
endpoint="${CLOUD_ENDPOINT}"
unset CLOUD_ENDPOINT

kuser="${KAFKA_USERNAME}"
unset KAFKA_USERNAME
kpass="${KAFKA_PASSWORD}"
unset KAFKA_PASSWORD

echo "Starting deployment.."
# Pipe all six secrets to builder.js via stdin in the expected order.
# builder.js reads them with readStdin() / cleanEnv() and zeroes them out
# after use.
printf "%s\n%s\n%s\n%s\n%s\n%s\n" \
  "$token" "$akey" "$skey" "$endpoint" "$kuser" "$kpass" | node /app/builder.js --env-file=.env

# printf "%s\n" \
#   "no token" | node /app/builder.js
