#!/bin/bash

set -eo pipefail

cd $(dirname $0)/..

# Bail if we see "model User" already in the Prisma schema.
if grep -q "model User" prisma/schema.prisma; then
    echo "User model already exists in Prisma schema"
    exit 0
fi

cd packages/server

GENERATE_TO=$(mktemp -d)/schema

# Generate the full Prisma schema.
bunx @better-auth/cli generate --output $GENERATE_TO -y

# Keep only the models. Delete everything before the first "model" line, but keep the
# first model line
awk 'found || /^model / {found=1; print}' "$GENERATE_TO" > "$GENERATE_TO.tmp" && mv "$GENERATE_TO.tmp" "$GENERATE_TO"

echo "Generated models saved to $GENERATE_TO"

cd ../../

# Append the models to the Prisma schema.
cat $GENERATE_TO >> prisma/schema.prisma

echo "Models appended to Prisma schema"