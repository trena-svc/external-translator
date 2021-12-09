#!/usr/bin/env bash

function join_by { local d=${1-} f=${2-}; if shift 2; then printf %s "$f" "${@/#/$d}"; fi; }

SERVER_URL=$1
TARGETS=$(echo $2 | tr "," "\n")

RAW_TEXT=`cat ./proxy-list.txt`
ARR=()
while read -r line; do
    ARR+=("\"$line\"")
done <<< "$RAW_TEXT"

CONCAT_ARR=$(join_by , ${ARR[@]})

for TARGET in $TARGETS; do
  DATA="{\"target\":\"$TARGET\",\"proxyList\":[$CONCAT_ARR]}"
  curl --request POST -sL \
       -d $DATA \
       --header "Content-Type: application/json" \
       --url "$SERVER_URL" > /dev/null

  echo "Save Proxy for [$TARGET]"
done
