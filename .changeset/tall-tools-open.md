---
"@eventuras/convertoapi": major
---

Harden security and improve operational readiness

- Add SSRF protection for URL-to-PDF with DNS rebinding checks (A+AAAA)
- Reuse singleton Playwright browser with per-request BrowserContext
- Add graceful browser shutdown via Fastify onClose hook
- Harden Dockerfile: read-only COPY, tini for signal handling, non-root user
- Add pod/container security contexts (drop ALL caps, seccomp, no privilege escalation)
- Add startup probe for Chromium cold-start tolerance
- Use standard Kubernetes labels (app.kubernetes.io/*)
- Fix Docker Hub image name (converto-api → converto)
- Add Vitest unit + integration tests (24 tests)
- Make rate limiting configurable via RATE_LIMIT_MAX
- Fix well-known endpoint auth method metadata
