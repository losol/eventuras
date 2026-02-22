# Docker Tagging Strategy

This document describes the Docker image tagging strategy used across Eventuras applications.

## Overview

All applications follow a consistent tagging strategy optimized for:
- **GitOps with Argo CD**: Predictable tags for automated deployments
- **Traceability**: Easy correlation between images and commits
- **Release management**: Clean version tags for production

## Tag Types

| Tag Pattern | Example | When Created | Purpose |
|-------------|---------|--------------|---------|
| `edge` | `losolio/eventuras-api:edge` | Internal PR | Latest build from PR branch |
| `edge-<sha>` | `losolio/eventuras-api:edge-abc1234` | Internal PR | Immutable PR build reference |
| `canary` | `losolio/eventuras-api:canary` | Push to main | Latest build from main |
| `main-<sha>` | `losolio/eventuras-api:main-abc1234` | Push to main | Immutable main build reference |
| `v<version>` | `losolio/eventuras-api:v2.27.1` | Release tag | Production releases |
| `latest` | `losolio/eventuras-api:latest` | Release tag | Latest stable release (demo/testing only) |
## Environment Mapping

```
┌─────────────┬────────────────┬─────────────────────────┐
│ Environment │ Image Tag      │ Trigger                 │
├─────────────┼────────────────┼─────────────────────────┤
│ Development │ canary         │ Any branch push         │
│ Staging     │ main           │ Push to main branch     │
│ Production  │ <version>      │ Git tag @app@x.y.z      │
└─────────────┴────────────────┴─────────────────────────┘
```

## Argo CD Integration

### Development Environment
Argo CD can watch the `edge` tag for development deployments:

```yaml
# Argo CD Application values
image:
  tag: edge
```

### Staging Environment
Argo CD watches the `canary` tag for staging deployments:

```yaml
# Argo CD Application values
image:
  tag: canary
```

### Production Environment
Production uses explicit version tags created during releases:

```yaml
# Argo CD Application values
image:
  tag: "v2.27.1"
```

## Release Process

1. **Open internal PR** → Builds and pushes with `edge`, `edge-<sha>` tags
2. **Fork PR** → Builds only (no push, no secrets access)
3. **Merge to main** → Builds with `canary`, `main-<sha>` tags
4. **Create release tag** (e.g., `@eventuras/api@2.27.1`)
5. **Release workflow** → Builds with `v2.27.1` and `latest` tags
6. **Update Argo CD** → Point production to new version tag

## Applications Using This Strategy

| Application | Image | Workflow |
|-------------|-------|----------|
| API | `losolio/eventuras-api` | `api-main.yml`, `api-release.yml` |
| Web | `losolio/eventuras-web` | `web-main.yml`, `web-release.yml` |
| Idem IDP | `losolio/idem-idp` | `idem-idp-main.yml` |

## Multi-Architecture Support

All images are built for multiple architectures:
- `linux/amd64` (x86_64)
- `linux/arm64` (Apple Silicon, ARM servers)

## Build Caching

GitHub Actions cache is used for faster builds:

```yaml
cache-from: type=gha
cache-to: type=gha,mode=max
```

## Best Practices

1. **Use `edge` for development** - Latest feature branch build
2. **Use `canary` for staging** - Latest main branch build
3. **Use `v*` for production** - Explicit versioned releases
4. **Use `latest` only for demo/quick-start** - Points to latest stable release
5. **Never use `latest` in production** - Always pin to a specific version
6. **Use SHA tags for debugging** - `edge-<sha>` or `main-<sha>` for exact builds
