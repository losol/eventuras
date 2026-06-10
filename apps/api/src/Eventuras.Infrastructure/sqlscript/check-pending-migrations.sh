#!/usr/bin/env sh
# Report EF migrations that are present in database-migrations.sql but have not
# yet been applied to the target database (i.e. the migrations that still need
# to run). The script reads its migration ids from the idempotent EF script, so
# it stays correct for whatever image version it ships in.
#
# Usage:
#   check-pending-migrations.sh [path-to-database-migrations.sql]
#
# Defaults to the database-migrations.sql sitting next to this script (the path
# both files have inside the eventuras-api image: /app/sqlscript/).
#
# The database connection is taken from the standard libpq environment
# (PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE) or a PG* connection URI,
# exactly like plain psql. Run this from a container that has psql.
#
# Pending migration ids are written to stdout, one per line (empty when up to
# date); all human-readable messages go to stderr, so stdout stays parseable.
#
# Exit codes:
#   0   database is up to date (no pending migrations)
#   10  one or more pending migrations
#   1   usage or runtime error
set -eu

SQL="${1:-$(dirname "$0")/database-migrations.sql}"
if [ ! -f "$SQL" ]; then
  echo "error: migration script not found: $SQL" >&2
  exit 1
fi

# One INSERT into __EFMigrationsHistory exists per migration; pull the ids from
# there. Matching up to the closing quote keeps names with underscores intact.
IDS="$(grep -oE "VALUES \('[0-9]{14}_[^']*'" "$SQL" | sed -E "s/^VALUES \('//; s/'\$//" | sort -u)"
if [ -z "$IDS" ]; then
  echo "error: no migration ids found in $SQL" >&2
  exit 1
fi

# Fresh database: the history table doesn't exist yet, so everything is pending.
HAS_TABLE="$(psql -X -A -t -q -v ON_ERROR_STOP=1 \
  -c "SELECT to_regclass('\"__EFMigrationsHistory\"') IS NOT NULL;" | tr -d '[:space:]')"
if [ "$HAS_TABLE" != "t" ]; then
  echo "Pending migrations (fresh database, no __EFMigrationsHistory):" >&2
  printf '%s\n' "$IDS"
  exit 10
fi

IDS_CSV="$(printf '%s' "$IDS" | tr '\n' ',')"
PENDING="$(psql -X -A -t -q -v ON_ERROR_STOP=1 -v ids="$IDS_CSV" <<'SQL_EOF'
WITH script(id) AS (
  SELECT unnest(string_to_array(trim(both ',' from :'ids'), ','))
)
SELECT s.id
FROM script s
WHERE NOT EXISTS (
  SELECT 1 FROM "__EFMigrationsHistory" h WHERE h."MigrationId" = s.id
)
ORDER BY s.id;
SQL_EOF
)"

if [ -n "$PENDING" ]; then
  echo "Pending migrations:" >&2
  printf '%s\n' "$PENDING"
  exit 10
fi

echo "Database is up to date; no pending migrations." >&2
exit 0
