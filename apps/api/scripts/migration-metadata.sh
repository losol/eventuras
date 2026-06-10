#!/usr/bin/env sh
# Emit migration metadata for the eventuras-api image as `key=value` lines
# (latest, count, sha) for use as GitHub Actions step outputs / OCI labels.
# Derived from the idempotent EF script so it can't drift from what ships.
set -eu

SQL="${1:-apps/api/src/Eventuras.Infrastructure/sqlscript/database-migrations.sql}"
if [ ! -f "$SQL" ]; then
  echo "error: migration script not found: $SQL" >&2
  exit 1
fi

# One INSERT into __EFMigrationsHistory per migration; ids are <ts>_<Name>.
IDS="$(grep -oE "VALUES \('[0-9]{14}_[^']*'" "$SQL" | sed -E "s/^VALUES \('//; s/'\$//" | sort -u)"
if [ -z "$IDS" ]; then
  echo "error: no migration ids found in $SQL (format changed or wrong path?)" >&2
  exit 1
fi

COUNT="$(printf '%s\n' "$IDS" | grep -c . || true)"
LATEST="$(printf '%s\n' "$IDS" | tail -1)"
SHA="$(sha256sum "$SQL" | cut -d' ' -f1)"

echo "latest=$LATEST"
echo "count=$COUNT"
echo "sha=$SHA"
