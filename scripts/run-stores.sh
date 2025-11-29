#!/bin/bash

set -eo pipefail

cd $(dirname $0)/..

STOP=false
while [[ "$#" -gt 0 ]]; do
    case $1 in
    --stop) STOP=true ;;
    *)
        echo "Unknown parameter passed: $1"
        exit 1
        ;;
    esac
    shift
done

docker compose down

if [ "$STOP" = true ]; then
    echo "All stores are stopped!"
    exit 0
fi

# Run the containers.
docker compose up -d

# Apply migrations.
bun prisma migrate dev
