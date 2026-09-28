#!/bin/sh
set -eu
# Jenkins stages may run in different containers. Provision in each one.
manager=$(node -p "require('./package.json').packageManager")
case "$manager" in
  pnpm@*) ;;
  *) echo 'Expected a pinned pnpm packageManager in package.json' >&2; exit 1 ;;
esac
npm install --global "$manager" --ignore-scripts
pnpm --version
