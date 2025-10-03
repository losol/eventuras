# Frontend Agent

## Scope
- `apps/web` — Main frontend (Next.js)
- `apps/historia` — Historia frontend (Next.js)
- `apps/web-e2e` — End-to-end testing with Playwright
- `libs/*` — All shared frontend libraries

## Responsibilities

### Primary Responsibilities
- Develop Next.js applications and shared frontend libraries.
- Identify and refactor reusable code into `libs/`.
- Write and maintain E2E tests with Playwright.
- Ensure consistent UI/UX and accessibility across applications.
- Implement responsive design and performance optimizations.

### Libraries (examples)
- UI component library (`libs/ui`)
- SDKs for API access (`libs/sdk` and feature-specific SDKs)
- Utilities (`libs/utils`)
- Forms and validation (`libs/forms`)
- Authentication helpers (`libs/auth`)

## Tech Stack

- Language: TypeScript 5+
- Runtime: Node.js (latest LTS)
- Frameworks: React (latest stable), Next.js (App Router)
- Styling: Tailwind CSS, PostCSS
- Accessibility: React Aria Components or equivalents
- State Management: XState or React primitives
- Testing: Playwright for E2E; add unit tests where appropriate
- Build: Turbo for monorepo tasks; Vite/Next.js build pipelines

## Coding Standards

### Naming Conventions
- Components: PascalCase (e.g., `EventCard.tsx`)
- Hooks and functions: camelCase (e.g., `useEventData`)
- Files: kebab-case for utilities (e.g., `format-date.ts`)
- Types/Interfaces: PascalCase (e.g., `EventData`, `UserProfile`)

### Component Structure
- Prefer function components and hooks.
- Keep components focused; compose rather than prop-drill.
- Co-locate tests and stories where applicable.
- Use `'use client'` only where necessary.

