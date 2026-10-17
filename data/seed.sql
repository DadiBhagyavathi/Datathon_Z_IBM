-- ==============================================================================
-- SecureAI Gateway — Synthetic Seed Data
-- Fictional records for demonstration and security verification
-- ==============================================================================

-- Clean up existing seed data
TRUNCATE TABLE audit_events, transactions, customers, employees, role_permissions, permissions, roles CASCADE;

-- 1. Seed Roles
INSERT INTO roles (id, name, description) VALUES
('senior_analyst', 'Senior Financial Analyst', 'Authorized to inspect detailed transaction records for enterprise accounts.'),
('branch_staff', 'Regional Branch Staff', 'Authorized to view aggregated summary metrics only.'),
('intern', 'Summer Intern', 'Restricted account with zero production record permissions.');

-- 2. Seed Permissions
INSERT INTO permissions (id, resource_type, operation, description) VALUES
('perm_tx_read', 'account_transactions', 'READ_DETAIL', 'Permission to read line-item transaction records.'),
('perm_tx_aggregate', 'account_transactions', 'READ_AGGREGATE', 'Permission to compute aggregate summary statistics.');

-- 3. Map Roles to Permissions
INSERT INTO role_permissions (role_id, permission_id) VALUES
('senior_analyst', 'perm_tx_read'),
('senior_analyst', 'perm_tx_aggregate'),
('branch_staff', 'perm_tx_aggregate');
-- Notice: 'intern' has NO permissions mapped.

-- 4. Seed Employees (Demo Personas)
INSERT INTO employees (id, display_name, role_id, email, status) VALUES
('emp_analyst_01', 'Alice Vance (Senior Analyst)', 'senior_analyst', 'alice.vance@fictional-bank.com', 'ACTIVE'),
('emp_branch_02', 'Bob Martinez (Branch Staff)', 'branch_staff', 'bob.martinez@fictional-bank.com', 'ACTIVE'),
('emp_intern_03', 'Charlie Smith (Intern)', 'intern', 'charlie.smith@fictional-bank.com', 'ACTIVE');

-- 5. Seed Synthetic Customers
-- Note: '9577690' is the target demonstration account from the hackathon specification.
INSERT INTO customers (id, display_name, synthetic_external_reference, sensitivity_class) VALUES
('cust_apex_01', 'Apex Global Logistics Corp', '9577690', 'HIGH'),
('cust_beacon_02', 'Beacon Tech Solutions', '1029384', 'STANDARD');

-- 6. Seed Synthetic Transactions for Account 9577690
INSERT INTO transactions (id, customer_id, category, amount, occurred_at, notes) VALUES
('tx_9577_01', 'cust_apex_01', 'Office Equipment', 820.50, '2026-10-15 14:32:00+00', 'Quarterly ergonomic supplies invoice #4812'),
('tx_9577_02', 'cust_apex_01', 'Cloud Infrastructure', 400.00, '2026-10-14 09:15:00+00', 'Monthly compute capacity allocation'),
('tx_9577_03', 'cust_apex_01', 'Corporate Travel', 200.00, '2026-10-12 18:45:00+00', 'Rail transit ticket for regional conference'),
('tx_9577_04', 'cust_apex_01', 'Software Subscriptions', 350.00, '2026-10-10 11:20:00+00', 'Annual dev tooling team seat renewal');

-- Seed Synthetic Transactions for Account 1029384
INSERT INTO transactions (id, customer_id, category, amount, occurred_at, notes) VALUES
('tx_1029_01', 'cust_beacon_02', 'Marketing Services', 1500.00, '2026-10-13 16:00:00+00', 'Q3 digital marketing retainer');

-- 7. Seed Initial Baseline Audit Records (Example Demonstrator Log)
INSERT INTO audit_events (event_id, timestamp, user_reference, target_resource, outcome, policy_action, reason_code, request_id, latency_ms) VALUES
('evt_seed_01', CURRENT_TIMESTAMP - INTERVAL '1 hour', 'emp_analyst_01', 'account:9577690', 'ALLOWED', 'ALLOW_MINIMAL_FIELDS', 'AUTH_OK', 'req-seed-001', 42),
('evt_seed_02', CURRENT_TIMESTAMP - INTERVAL '45 minutes', 'emp_intern_03', 'account:9577690', 'DENIED', 'DENY', 'RBAC_NO_PERMISSION', 'req-seed-002', 4);
