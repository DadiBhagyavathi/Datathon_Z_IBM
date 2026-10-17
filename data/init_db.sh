#!/usr/bin/env bash
# ==============================================================================
# Helper Script: Initialize and Seed PostgreSQL Database
# ==============================================================================

set -euo pipefail

DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_USER="${DB_USER:-secureai_user}"
DB_NAME="${DB_NAME:-secureai}"

echo "🔄 Initializing SecureAI Database ($DB_NAME on $DB_HOST:$DB_PORT)..."

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Run migration
echo "Applying migrations..."
PGPASSWORD="${DB_PASSWORD:-secureai_pass}" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$DIR/migrations/001_initial_schema.sql"

# Run seed
echo "Seeding synthetic data..."
PGPASSWORD="${DB_PASSWORD:-secureai_pass}" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$DIR/seed.sql"

echo "✅ Database initialized and seeded successfully!"
