# SecureAI Gateway
### Privacy-Preserving Enterprise AI on IBM LinuxONE

**IBM Z Datathon 2026 | Theme 2: AI Secured – Innovation Without Exposure**

> **Project Status:** Proposed Proof of Concept — features will be marked as implemented only after development and testing.

## 1. Project Overview

SecureAI Gateway is a privacy-preserving enterprise AI application designed to help employees use AI safely without unnecessarily exposing sensitive information such as customer details, financial records, personal identifiers, and confidential company data.

We plan to build a ChatGPT-like web interface where employees can submit questions and receive AI-generated insights. A Security Gateway will operate between the employee interface and IBM Granite AI.

Before information reaches the AI model, the gateway verifies the user's permissions, retrieves only authorized records, detects sensitive information, and sanitizes the data. It also checks AI responses and maintains privacy-conscious audit logs.

The application is intended to run on IBM LinuxONE, subject to verification of the available environment and AI inference capabilities.

## 2. Problem Statement

Organizations increasingly want to use AI to analyze business information, but employees may accidentally expose sensitive data when submitting prompts or documents to AI systems.

For example, an employee might submit:

`Analyze Ravi's recent transactions. Account number: 9577690`

If sensitive information is passed directly to an AI model without appropriate controls, it may be unnecessarily exposed. Weak access controls can also allow employees to retrieve records they are not authorized to view.

**Our problem statement:** Enterprise AI use can expose sensitive data when prompts or retrieved records are sent to models without strong identity, access, and privacy controls.

## 3. Proposed Solution

We propose SecureAI Gateway, an application-layer security system that sits between employees and IBM Granite AI.

The gateway will:

- Authenticate employees and identify their roles.
- Verify permissions before retrieving customer or transaction records.
- Retrieve only the data the employee is authorized to access.
- Detect personally identifiable information (PII).
- Redact or tokenize sensitive identifiers when appropriate.
- Send only the minimum authorized and sanitized context to IBM Granite.
- Check AI responses for prohibited disclosures.
- Record security decisions without unnecessarily storing raw sensitive information.

The objective is to preserve the usefulness of AI while reducing unnecessary exposure of confidential data.

## 4. Project Architecture

```text
                 EMPLOYEE
                     |
                     v
          +----------------------+
          | React Web Interface  |
          | Login + Chat Window  |
          +----------------------+
                     |
                     v
          +----------------------+
          |   FastAPI Backend    |
          | Request Validation   |
          +----------------------+
                     |
                     v
          +----------------------+
          |  SECURITY GATEWAY    |
          |----------------------|
          | Authentication       |
          | Role-Based Access    |
          | PII Detection        |
          | Redaction/Tokenizing |
          | Policy Enforcement   |
          | Response Validation |
          | Audit Logging        |
          +----------------------+
              |             |
              v             v
    +----------------+  +----------------+
    | PostgreSQL     |  | IBM Granite AI |
    | Synthetic Data |  | Approved Input |
    | Token Vault    |  | AI Inference   |
    | Audit Events   |  +----------------+
    +----------------+          |
                                v
                    +----------------------+
                    | Response Security    |
                    | Check and Filtering  |
                    +----------------------+
                                |
                                v
                    +----------------------+
                    | Answer in Chat UI    |
                    +----------------------+
```

**Important:** The architecture above describes the proposed design. Actual deployment of IBM Granite and the application on LinuxONE must be verified before being claimed as completed.

## 5. How the System Works

Consider an employee asking:

`Analyze Ravi's recent transactions for account 9577690.`

### Step 1: Employee Interface

The employee opens our web application and submits a question through the chat interface.

**Technology:** React

### Step 2: Backend Receives the Request

The backend receives the request, validates its structure, and identifies the authenticated user.

**Technology:** Python and FastAPI

### Step 3: Identity and Authorization

The Security Gateway checks the employee's identity, role, and permission to access the requested account.

For example:
- An authorized employee can request an approved transaction summary.
- An employee without the required permission receives an access-denied response.

The permission check happens on the server before data retrieval. The AI model does not decide whether the employee is authorized.

**Methodology:** Role-Based Access Control (RBAC)

### Step 4: Authorized Data Retrieval

If permission is granted, the gateway retrieves only the relevant transaction records from the database.

The account number may be required internally to locate the records, but it does not automatically need to be included in the AI prompt.

**Technology:** PostgreSQL

### Step 5: Sensitive Data Detection

The gateway checks the retrieved information and prompt for sensitive identifiers.

For example:

Before sanitization:

`Account: 9577690`

After sanitization:

`Account: [REDACTED]`

If a consistent reference is needed, the gateway may instead replace the identifier with a generated token.

**Technology:** Microsoft Presidio and suitable recognizers, supplemented by validation and testing.

### Step 6: Tokenization and the Token Vault

Tokenization replaces a real identifier with a generated reference.

Example:

| Original identifier | Token |
|---|---|
| Fictional account ID: 9577690 | ACC-TKN-01 |
| Fictional account ID: 4581237 | ACC-TKN-02 |

The mapping is stored in a restricted token vault. Only the authorized gateway service should be able to access the mapping.

Employees and Granite must not have direct access to the token vault.

Tokenization is not the same as anonymization because the original value can be recovered if the mapping is available.

### Step 7: IBM Granite Generates Insights

The gateway sends only the approved, sanitized information needed for analysis.

Example context:

`Analyze these recent transactions for customer ACC-TKN-01: shopping ₹2,000, UPI ₹500, salary credit ₹10,000.`

Granite analyzes the supplied information and generates an answer without requiring the original account number.

**Technology:** IBM Granite, subject to model and inference access being available.

### Step 8: Response Validation

Before returning the response, the gateway checks whether it contains information that should not be disclosed.

The system should not assume that every AI-generated answer is automatically safe or correct.

### Step 9: Audit Logging

The system records relevant security events, including:

- Timestamp
- Pseudonymous user reference
- Requested operation
- Authorization outcome
- Redaction or policy action
- Reason for denial, when applicable

Raw prompts, credentials, token mappings, and sensitive identifiers should not be logged unnecessarily.

### Step 10: Display the Answer

The employee sees the permitted AI-generated answer in our ChatGPT-like interface.

The overall workflow is:

**Employee → React → FastAPI → Security Gateway → Authorized Data Retrieval → Sanitization → Granite → Response Checks → Employee**

## 6. Technology Stack

| Technology | Purpose |
|---|---|
| React | Builds the employee-facing chat interface and login screens. |
| Python | Implements gateway logic, data processing, and integration. |
| FastAPI | Receives requests and connects the frontend to backend services. |
| Microsoft Presidio | Detects supported sensitive-data patterns. |
| PII Recognizers | Help identify identifiers such as emails and phone numbers. |
| PostgreSQL | Stores synthetic business records, token mappings, policy metadata, and audit events. |
| IBM Granite | Generates AI responses from approved context. |
| IBM LinuxONE | Intended enterprise deployment and AI inference platform. |
| Podman | Optional containerization for repeatable deployment. |
| pytest | Supports automated testing of application and security behavior. |

The precise Granite integration method will depend on the inference endpoint or model-serving option available to the team.

## 7. Data and Privacy

The prototype will use synthetic, fictional data only.

Planned data includes:

- Fictional customer profiles
- Generated customer identifiers
- Mock transaction records
- Synthetic employee roles and permissions
- Sample prompts containing fictional sensitive-data patterns
- Prompt-injection and unauthorized-access test cases
- Audit events generated during testing

**Privacy rule:** Do not use real Aadhaar numbers, PAN details, bank-account data, passwords, medical records, production logs, or real customer datasets in the prototype unless explicitly authorized.

Synthetic data allows the team to demonstrate the workflow without exposing real individuals or organizations.

## 8. Security Methodology

### 8.1 Authentication

Verify the employee's identity before processing protected requests.

### 8.2 Role-Based Access Control

Restrict access according to the user's assigned role and permissions.

### 8.3 Least Privilege

Give every component only the permissions necessary for its function.

For example:
- The employee can submit requests through the interface.
- Granite receives approved context for analysis.
- The gateway controls authorization and data retrieval.
- The token vault has restricted access.
- Audit storage records security events without unnecessary secrets.

### 8.4 Data Minimization

Send only the information required to answer the employee's question.

### 8.5 PII Redaction and Tokenization

Remove or replace sensitive identifiers before the information is sent to Granite when required by the applicable policy.

### 8.6 Prompt-Injection Testing

Test whether malicious prompts can persuade the assistant to ignore instructions or reveal restricted information.

Authorization must remain enforced independently of the model's instructions.

### 8.7 Response Validation

Check generated responses for prohibited disclosures before displaying them.

### 8.8 Privacy-Conscious Audit Logging

Record relevant decisions while avoiding unnecessary storage of raw sensitive content.

## 9. Suggested GitHub Repository Structure

```text
secureai-gateway/
│
├── README.md
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── api/
│   │   ├── auth/
│   │   ├── gateway/
│   │   ├── pii/
│   │   ├── token_vault/
│   │   ├── retrieval/
│   │   ├── llm/
│   │   ├── audit/
│   │   └── models/
│   │
│   ├── tests/
│   └── requirements.txt
│
├── data/
│   └── README.md
│
├── docs/
│   ├── architecture.md
│   ├── security-tests.md
│   └── demo-script.md
│
├── deployment/
│   └── README.md
│
├── .env.example
├── .gitignore
└── LICENSE
```

This is a suggested structure. The team can adapt it as implementation progresses.

**Never commit passwords, API keys, access tokens, `.env` files, or real sensitive data to GitHub.**

## 10. Team Responsibilities

| Workstream | Responsibilities |
|---|---|
| Frontend Development | React interface, login screens, chat window, and displaying responses. |
| Backend Development | FastAPI endpoints, request validation, and service integration. |
| Security Development | Authorization rules, PII detection, redaction, tokenization, and response checks. |
| Database Development | Synthetic data, PostgreSQL schema, token vault, and audit events. |
| AI Integration | Granite connection, safe context construction, and AI response handling. |
| Deployment and Testing | LinuxONE setup, containerization if feasible, security tests, and deployment evidence. |
| Documentation and Presentation | Architecture documentation, test results, demo preparation, and project pitch. |

Team members can take multiple responsibilities depending on team size.

All members should coordinate through GitHub issues, branches, pull requests, and regular integration.

## 11. Security Testing Plan

| Test | Expected Result |
|---|---|
| Authorized access | The user retrieves only permitted records. |
| Unauthorized access | The gateway denies access before retrieving restricted data. |
| PII detection | Supported sensitive patterns are detected and sanitized according to policy. |
| Model input validation | Original sensitive identifiers are absent from the model-bound payload when required by policy. |
| Prompt injection | Instructions to bypass policy do not override server-side authorization. |
| Token vault protection | Employees and Granite cannot directly access token mappings. |
| Audit logging | Allowed and denied actions produce appropriate audit events. |
| Response validation | Prohibited disclosures are detected and handled according to policy. |
| Answer usefulness | Permitted business questions remain answerable after sanitization. |

The team must record actual test results after implementation. Detection errors, limitations, and unsuccessful cases should be documented honestly.

## 12. IBM Z Datathon Relevance

Our project aligns with **Theme 2: AI Secured – Innovation Without Exposure**.

### Community and Business Value

The solution addresses the risk of sensitive information being unnecessarily exposed when organizations use AI for business analysis.

Potential users include:
- Enterprise employees
- Security and privacy teams
- IT administrators
- Banks and insurance organizations
- Healthcare providers
- Public-sector organizations

### Technical Design

The proposed architecture combines:
- Identity-aware access control
- Privacy-preserving data processing
- AI-assisted analysis
- Restricted token mappings
- Response validation
- Security audit events

### IBM LinuxONE Usage

IBM LinuxONE is the intended deployment platform for demonstrating the enterprise AI workflow.

The team should demonstrate the actual LinuxONE environment, application deployment, and Granite inference where available. Containerization, security, and scalability should be presented as implemented capabilities only when verified.

### Originality and Evaluation

Our contribution is the integration of authorization, data minimization, PII processing, AI response checks, and privacy-conscious auditing into a testable workflow.

We will evaluate the prototype using repeatable tests rather than claiming that it is completely secure.

The project should demonstrate:
1. A permitted request receiving a useful answer.
2. An unauthorized request being denied.
3. Sensitive information being sanitized before AI inference.
4. A prompt-injection attempt being handled safely.
5. Audit events being recorded without unnecessary sensitive content.

## 13. Suggested 24-Hour Implementation Plan

| Time | Task |
|---|---|
| Hours 0–3 | Finalize roles, synthetic data schema, policies, and test cases. |
| Hours 3–7 | Implement FastAPI request handling and server-side authorization. |
| Hours 7–11 | Add synthetic data retrieval, PII detection, redaction/tokenization, and protected mapping storage. |
| Hours 11–15 | Integrate Granite if access is available; otherwise use a clearly labelled development mock. |
| Hours 15–19 | Implement response checks, audit events, and security tests. |
| Hours 19–22 | Build the React interface and prepare a working demonstration. |
| Hours 22–24 | Verify the end-to-end workflow, collect evidence, and document limitations. |

The team should prioritize a complete and tested workflow over implementing too many unfinished features.

## 14. Three-Minute Demonstration Plan

**0:00–0:25 — Introduction**

Show the login page and explain the employee-facing AI interface.

**0:25–0:55 — Authorized Request**

Submit a permitted business question using fictional transaction records and show the AI-generated answer.

**0:55–1:25 — Unauthorized Request**

Attempt to access a restricted record and demonstrate the gateway denying access.

**1:25–1:55 — Sensitive Data Protection**

Submit a prompt containing fictional sensitive identifiers and show the sanitized model input.

**1:55–2:25 — Security Test**

Demonstrate a prompt-injection or secret-extraction test and explain the result.

**2:25–2:50 — Audit Events**

Show the security log with the action, outcome, timestamp, and reason code, without exposing unnecessary sensitive content.

**2:50–3:00 — IBM LinuxONE and Results**

Show the actual deployment environment and model integration, summarize measured test results, and state any limitations.

## 15. Limitations

- PII detection may miss sensitive values or incorrectly flag ordinary text.
- Tokenization is reversible if the mapping vault is accessible.
- A language model may generate incorrect or unsafe information.
- Response filtering cannot guarantee that every possible disclosure will be prevented.
- Running on IBM LinuxONE does not automatically make an application production-secure.
- Live Granite integration and LinuxONE deployment must be verified before they are reported as completed.

SecureAI Gateway is a proof of concept. It should not be described as certified or production-ready without appropriate security testing and validation.

## 16. Project Pitch

**SecureAI Gateway enables safer enterprise AI by enforcing identity-aware access, protecting sensitive information before inference, and auditing security decisions while allowing IBM Granite to answer useful questions from authorized context.**

Built as a proposed proof of concept for the **IBM Z Datathon 2026 — Theme 2: AI Secured – Innovation Without Exposure**.
