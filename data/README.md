# Synthetic Data & Database Schemas

This directory contains the database migration scripts and synthetic datasets for SecureAI Gateway.

## Files
- `migrations/001_initial_schema.sql`: DDL for roles, permissions, employees, customers, transactions, and audit_events.
- `seed.sql`: Synthetic data generator populating test personas and fictional account `9577690`.
- `init_db.sh`: Helper script to drop, recreate, and seed the local database.

## Safety & Compliance
- **All data is 100% synthetic.**
- No real customer names, accounts, credit cards, or personal identifiers are stored.
- Target account for demonstrations: `9577690`.
