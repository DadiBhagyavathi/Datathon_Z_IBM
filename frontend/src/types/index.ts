// ──────────────────────────────────────────────────────────────────
// SecureAI Gateway — TypeScript Types
// IBM Z Datathon 2026
// ──────────────────────────────────────────────────────────────────

export type PolicyAction = 'ALLOW_MINIMAL_FIELDS' | 'AGGREGATE' | 'REDACT' | 'DENY';
export type RoleId = 'senior_analyst' | 'branch_staff' | 'intern';
export type ModelAdapter = 'mock-inference-v1' | 'granite-api';
export type AccessLevel = 'full' | 'aggregate' | 'none';
export type OutcomeType = 'ALLOWED' | 'DENIED';

export interface Employee {
  id: string;
  displayName: string;
  firstName: string;
  roleId: RoleId;
  roleName: string;
  email: string;
  avatarInitials: string;
  permissions: string[];
  accessLevel: AccessLevel;
  cardColor: 'blue' | 'yellow' | 'red';
  accentColor: string;
  description: string;
}

export interface SecurityMeta {
  policyAction: PolicyAction;
  piiDetected: number;
  piiRedacted: number;
  piiTypes: string[];
  fieldsStripped: number;
  strippedFields: string[];
  auditEventId: string;
  modelAdapter: ModelAdapter;
  latencyMs: number;
  isBlocked: boolean;
  blockReason?: string;
  sanitizedPayloadSizeBytes?: number;
  injectionAttemptDetected?: boolean;
  promptTokens?: number;
  dbRowsFetched?: number;
  aiCallMade?: boolean;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  securityMeta?: SecurityMeta;
  isError?: boolean;
}

export interface AuditEvent {
  eventId: string;
  timestamp: Date;
  userReference: string;
  targetResource: string;
  outcome: OutcomeType;
  policyAction: PolicyAction;
  reasonCode: string;
  requestId: string;
  latencyMs: number;
}

export interface SessionStats {
  totalRequests: number;
  blockedRequests: number;
  allowedRequests: number;
  aggregateRequests: number;
  redactedRequests: number;
  piiValuesDetected: number;
  piiValuesRedacted: number;
  injectionAttemptsBlocked: number;
}

export interface ApiResponse {
  answer?: string;
  error?: string;
  security: SecurityMeta;
}

export interface SuggestedQuery {
  label: string;
  query: string;
  tag: 'normal' | 'pii' | 'injection' | 'denied' | 'aggregate';
  tagLabel: string;
}
