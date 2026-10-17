# Architecture Specification: SecureAI Gateway

## 1. System Philosophy

SecureAI Gateway is designed for regulated enterprise environments where employees interact with generative AI to query business records. The fundamental principle is **strict boundary separation**:

> **AI models must never be trusted to make authorization decisions or self-police database retrieval.**

In traditional or naive AI setups:
- The user prompt is forwarded directly to an LLM or an agent with arbitrary tool access.
- The agent decides what SQL query or API to execute.
- Prompt injection or ambiguous inputs can trigger unauthorized record retrieval or massive data leakage.

In **SecureAI Gateway**:
- The **Go backend** owns the network boundary, authenticates the user, verifies RBAC permissions, and issues constrained, parameterized SQL queries to PostgreSQL.
- The **Policy-Guided Context Release** engine strips, aggregates, or redacts fields before passing context across the network boundary to the Python AI Engine.
- The **Python AI Engine** performs secondary PII sanitization (Presidio/regex) and formats a minimal prompt for inference (IBM Granite / Mock).
- Response disclosure filters ensure no forbidden identifiers appear in the final response.

---

## 2. Service Boundaries & Trust Zones

```
[ UNTRUSTED ZONE ]
  Employee Browser (React UI)
          │
          │ HTTPS (JWT / Demo Role Header)
          ▼
[ CONTROL & SECURITY BOUNDARY ]
  Go API Backend (Port 8080)
    ├─ Auth & RBAC Middleware
    ├─ Policy-Guided Context Release
    ├─ Parameterized SQL Queries
    └─ Privacy-Conscious Audit Logger
          │                             │
          │ Internal SQL                │ Private HTTP (/internal/v1/analyze)
          ▼                             ▼
  PostgreSQL (Port 5432)        [ AI PROCESSING WORKER ]
  (Synthetic Business Data &    Python AI Engine (Port 8000)
   Audit Trail)                   ├─ PII Detection & Anonymizer
                                  ├─ Minimal Prompt Builder
                                  └─ Response Disclosure Filter
                                        │
                                        │ Secure Inference Call
                                        ▼
                                [ INFERENCE TIER ]
                                IBM Granite / Labeled Mock
```

### Trust Boundary Invariants
1. **Frontend $\rightarrow$ Go:** The frontend is untrusted. All role claims, permissions, and query parameters are re-verified on the server.
2. **Go $\rightarrow$ PostgreSQL:** Only parameterized queries are used. Go connects with a dedicated role and strictly queries authorized tenant/customer partitions.
3. **Go $\rightarrow$ Python AI Engine:** Python has **no access to the database**. It receives only the pre-filtered, policy-approved JSON context.
4. **Python AI Engine $\rightarrow$ Inference Tier:** The inference adapter forwards only sanitized, minimal context.
5. **Logging:** Auditing captures event IDs, pseudonymous user IDs, policy actions, reason codes, and latencies—never raw prompts or sensitive financial data.

---

## 3. Policy-Guided Context Release Matrix

| Policy Action | Trigger Condition | Data Modification Applied | Risk Mitigated |
| :--- | :--- | :--- | :--- |
| **`ALLOW_MINIMAL_FIELDS`** | User has direct read permission; task requires specific item details. | Excludes notes, metadata, and sensitive IDs; includes only `date`, `category`, and `amount`. | Overexposure of non-essential records. |
| **`AGGREGATE`** | Task asks for summaries, totals, averages, or general spending volume. | Calculates summary metrics in Go; passes zero row-level transaction records to AI. | Leakage of individual customer transactions. |
| **`REDACT`** | Cross-account comparative analysis where identities are non-essential. | Replaces names, emails, and account numbers with surrogate tokens (`ACCT-XXXX`). | Direct identifier linkage and deanonymization. |
| **`DENY`** | User lacks permission, or policy requirements cannot be safely satisfied. | Rejects request with HTTP 403; retrieves 0 records from DB; invokes 0 AI calls. | Unauthorized data access & privilege escalation. |
