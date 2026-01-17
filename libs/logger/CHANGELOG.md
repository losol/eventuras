# @eventuras/logger

## 0.6.0

### Minor Changes

- ### 🧱 Features
  - Integrate OpenTelemetry for enhanced logging capabilities with distributed tracing support
  - Integrate Sentry transport for error tracking and monitoring
  - Add separate Debug utilities for development debugging

  ### 🐞 Bug Fixes
  - Move `@opentelemetry/api` to regular dependencies for proper resolution

## 0.5.0

### 🧱 Features

- feat(logger): add separate Debug utilities (88e1494) [@eventuras/logger]
- feat(logger): enhanced logging capabilities (f3eb797) [@eventuras/logger]
- feat(logger): bundle it up (9ed77c3) [@eventuras/logger]

### 🧹 Maintenance

- chore(logger): remove pino-pretty (28af76f) [@eventuras/logger]

## 0.4.0

### Major Changes

- Renamed package from @eventuras/utils to @eventuras/logger
- Changed import path from `@eventuras/utils/src/Logger` to `@eventuras/logger`

## 0.4.0 (as @eventuras/utils)

### Minor Changes

- ## Initial history (pre-Changesets)
  - feat(utils): add optional environment variables (8117fcb)
