#!/bin/sh

export $(cat ./.env | xargs)
token="${CONTAINER_API_TOKEN}"
unset CONTAINER_API_TOKEN

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
# echo $json | node script.js
printf "%s\n%s\n%s\n%s\n%s\n%s\n" \
  "$token" "$akey" "$skey" "$endpoint" "$kuser" "$kpass" | node script.js
