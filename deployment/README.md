# Deployment Guide: SecureAI Gateway

## Target Environments
1. **Local Development:** Linux x86_64 / macOS / Windows with Docker/Podman
2. **Target Deployment:** IBM LinuxONE / Linux on IBM Z (`s390x`)

## Deployment Options

### 1. Podman / Docker Compose
```bash
cd deployment
podman-compose up -d
# Or: docker compose up -d
```

### 2. LinuxONE / s390x Verification Notes
- Go builds natively on Linux on IBM Z (`GOARCH=s390x`).
- Python standard library and FastAPI run on s390x.
- Verify container image base compatibility (e.g. `registry.access.redhat.com/ubi9/ubi-minimal:latest` or `s390x/postgres:alpine`).
- Fallback: Local Linux container deployment with documented platform readiness.
