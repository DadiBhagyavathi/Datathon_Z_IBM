import type { Employee } from '../types';

// ──────────────────────────────────────────────────────────────────
// Employee Personas
// ──────────────────────────────────────────────────────────────────
export const EMPLOYEES: Employee[] = [
  {
    id: 'emp_analyst_01',
    displayName: 'Alice Vance',
    firstName: 'Alice',
    roleId: 'senior_analyst',
    roleName: 'Senior Financial Analyst',
    email: 'alice.vance@fictional-bank.com',
    avatarInitials: 'AV',
    permissions: ['READ_DETAIL', 'READ_AGGREGATE'],
    accessLevel: 'full',
    cardColor: 'blue',
    accentColor: '#0f62fe',
    description: 'Full access to line-item transactions and aggregate summaries.',
  },
  {
    id: 'emp_branch_02',
    displayName: 'Bob Martinez',
    firstName: 'Bob',
    roleId: 'branch_staff',
    roleName: 'Regional Branch Staff',
    email: 'bob.martinez@fictional-bank.com',
    avatarInitials: 'BM',
    permissions: ['READ_AGGREGATE'],
    accessLevel: 'aggregate',
    cardColor: 'yellow',
    accentColor: '#f1c21b',
    description: 'Aggregate summaries only. No access to individual records.',
  },
  {
    id: 'emp_intern_03',
    displayName: 'Charlie Smith',
    firstName: 'Charlie',
    roleId: 'intern',
    roleName: 'Summer Intern',
    email: 'charlie.smith@fictional-bank.com',
    avatarInitials: 'CS',
    permissions: [],
    accessLevel: 'none',
    cardColor: 'red',
    accentColor: '#fa4d56',
    description: 'No production record permissions. All requests are denied.',
  },
];
