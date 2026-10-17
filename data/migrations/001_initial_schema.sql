-- ==============================================================================
-- SecureAI Gateway — Initial Database Schema Migration
-- Migration: 001_initial_schema.sql
-- ==============================================================================

-- 1. Roles table
CREATE TABLE IF NOT EXISTS roles (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT
);

-- 2. Permissions table
CREATE TABLE IF NOT EXISTS permissions (
    id VARCHAR(50) PRIMARY KEY,
    resource_type VARCHAR(50) NOT NULL,
    operation VARCHAR(50) NOT NULL,
    description TEXT
);

-- 3. Role-Permission mappings
CREATE TABLE IF NOT EXISTS role_permissions (
    role_id VARCHAR(50) REFERENCES roles(id) ON DELETE CASCADE,
    permission_id VARCHAR(50) REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- 4. Synthetic Employees table
CREATE TABLE IF NOT EXISTS employees (
    id VARCHAR(50) PRIMARY KEY,
    display_name VARCHAR(100) NOT NULL,
    role_id VARCHAR(50) REFERENCES roles(id),
    email VARCHAR(100) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE'
);

-- 5. Synthetic Customers table
CREATE TABLE IF NOT EXISTS customers (
    id VARCHAR(50) PRIMARY KEY,
    display_name VARCHAR(100) NOT NULL,
    synthetic_external_reference VARCHAR(50) UNIQUE NOT NULL,
    sensitivity_class VARCHAR(20) DEFAULT 'STANDARD',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Synthetic Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR(50) PRIMARY KEY,
    customer_id VARCHAR(50) REFERENCES customers(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    occurred_at TIMESTAMP WITH TIME ZONE NOT NULL,
    notes TEXT
);

-- 7. Privacy-Conscious Audit Events table
-- Notice: No raw user prompts, passwords, or customer personal identifiers are stored.
CREATE TABLE IF NOT EXISTS audit_events (
    event_id VARCHAR(50) PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_reference VARCHAR(50) NOT NULL,
    target_resource VARCHAR(100) NOT NULL,
    outcome VARCHAR(20) NOT NULL, -- 'ALLOWED' | 'DENIED'
    policy_action VARCHAR(50) NOT NULL, -- 'ALLOW_MINIMAL_FIELDS' | 'AGGREGATE' | 'REDACT' | 'DENY'
    reason_code VARCHAR(100) NOT NULL,
    request_id VARCHAR(50) NOT NULL,
    latency_ms INTEGER DEFAULT 0
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_customers_ext_ref ON customers(synthetic_external_reference);
CREATE INDEX IF NOT EXISTS idx_transactions_customer ON transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_events(timestamp);
