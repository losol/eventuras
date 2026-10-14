# @eventuras/google-api

## 0.2.4

### Patch Changes

- c575450: Ship type declarations again. `@eventuras/vite-config` 0.4.0 builds JavaScript only, so each package now runs `tsc --emitDeclarationOnly` after `vite build`. Test and story files stay out of the emitted types.

## 0.2.3

### Patch Changes

- 4da06c8: Consume the shared foundation packages (`eslint-config`, `typescript-config`, `vite-config`, `logger`, `core`, `core-nextjs`, `app-config`) from npm — they are maintained in the origo repo now; the workspace copies are removed

## 0.2.2

### Patch Changes

- 7c9fe79: chore: update dependencies

## 0.2.1

### Patch Changes

- chore: update dependencies across frontend packages

## 0.2.0

### Minor Changes

### 🧱 Features

- feat(google-api): google api library (3ab1a88) [@eventuras/google-api]
