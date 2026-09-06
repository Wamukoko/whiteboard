#!/usr/bin/env sh
# WhiteBoard database backup — run on a schedule (cron) in staging/production.
# Restore drill:  restore into a throwaway DB, run <scripts/restore-check.sql>,
#                 then drop the throwaway. Execute monthly, verified by qa.

set -eu

: "${DATABASE_URL:?DATABASE_URL is required}"
: "${BACKUP_DIR:=${PWD}/backups}"

mkdir -p "$BACKUP_DIR"

# Parse DATABASE_URL=postgresql://user:pass@host:port/db
HOST=$(echo "$DATABASE_URL" | sed -E 's#postgres(ql)?://[^@]*@([^:/]+).*#\2#')
PORT=$(echo "$DATABASE_URL" | sed -E 's#postgres(ql)?://[^@]*@[^:/]+:([0-9]+)/.*#\2#')
DB=$(echo "$DATABASE_URL" | sed -E 's#postgres(ql)?://.*\/([^/?]+).*#\2#')
USER=$(echo "$DATABASE_URL" | sed -E 's#postgres(ql)?://([^:]+):.*#\2#')
export PGPASSWORD=$(echo "$DATABASE_URL" | sed -E 's#postgres(ql)?://[^:]+:([^@]+)@.*#\2#')

STAMP=$(date -u +%Y%m%dT%H%M%SZ)
FILE="$BACKUP_DIR/whiteboard-$STAMP.dump"

echo "Backing up $DB@$HOST:$PORT -> $FILE"
pg_dump -h "$HOST" -p "$PORT" -U "$USER" -Fc -f "$FILE" "$DB"

# Keep 14 daily backups, drop older files.
ls -1t "$BACKUP_DIR"/whiteboard-*.dump 2>/dev/null | tail -n +15 | xargs -r rm -f

echo "Backup complete: $(ls -lh "$FILE" | awk '{print $5}')"