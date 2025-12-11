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

### Payload CMS Admin UI Components
When building custom UI components for Payload CMS admin (`apps/historia`):

1. **Use Payload Components First**: Always prefer Payload's built-in components from `@payloadcms/ui`:
   - `Button` - Standard button component
   - `toast` - Notification system (function, not hook)
   - `useDocumentInfo()` - Access to current document/collection
   - `useFormFields()` - Access to form field values
   - `useForm()` - Form submission and state
   - `useAuth()` - Current user authentication

2. **Custom Component Registration**:
   - Custom admin components must be registered in collection config using string paths
   - Example: `SaveButton: '@/collections/Orders/components/OrderEditComponents#OrderSaveButton'`
   - Components must be `'use client'` when using Payload hooks
   - Run `pnpm payload generate:importmap` after adding new components

3. **Multi-Tenant Awareness**:
   - Always include `tenant` field when creating entities in multi-tenant collections
   - Extract tenant from parent entity: `typeof order.tenant === 'string' ? order.tenant : order.tenant?.id`
   - BusinessEvents collection is tenant-agnostic (cross-tenant audit log)

4. **Best Practices**:
   - Use Payload's toast instead of external notification libraries
   - Custom components should match Payload's admin UI style
   - Document actor (user) in business events for audit trail
   - Use idempotency keys for payment operations: `capture-${orderId}`, `cancel-${orderId}`, `refund-${orderId}`

