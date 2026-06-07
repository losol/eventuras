# Cline (Claude) Rules for Eventuras

You are assisting with the Eventuras project: a platform for course, event, and conference management.

## Project Structure

This monorepo contains:
- `apps/api` — C# .NET backend API
- `apps/web` — Next.js frontend for participants/organizers
- `apps/historia` — Next.js knowledge CMS (in development)
- `libs/` — Shared TypeScript libraries

## Context-Aware Agent Selection

Based on the file path, use the appropriate agent instructions:

### Backend (C# .NET)
**Path**: `apps/api/`
**Instructions**: `.github/agents/backend-developer.md`

Key context:
- ASP.NET Core + Entity Framework Core + PostgreSQL
- Clean architecture with Services layer
- External integrations (Stripe, Twilio, PowerOffice, etc.)
- XML documentation for public APIs

### Frontend (TypeScript/React)
**Paths**: `apps/web/`, `apps/historia/`, `libs/`, `apps/web-e2e/`
**Instructions**: `.github/agents/frontend-developer.md`

Key context:
- React 19+ with Next.js 15+ (App Router)
- Tailwind CSS for styling
- Actively refactor reusable code to `libs/`
- Playwright for E2E testing
- TSDoc for documentation

## Code Standards

### Commits
Use Conventional Commits:
- `feat(scope): description`
- `fix(scope): description`
- `refactor(scope): description`
- `test(scope): description`

### Testing
- Backend: xUnit tests in `apps/api/tests/`
- Frontend: Playwright E2E tests in `apps/web-e2e/`
- Write tests for critical paths and new features

### Documentation
- C#: XML comments on public APIs
- TypeScript: TSDoc for exported functions/components
- README.md in each app/library when needed

## Development Workflow

1. Read the relevant agent instructions first
2. Follow the coding standards defined in the agent file
3. Commit frequently to your working branch
4. Open PRs early (drafts are welcome)
5. Ensure tests pass before requesting review

## Architecture Principles

- **Backend**: SOLID principles, dependency injection, thin controllers
- **Frontend**: Component composition, extract to libs when reusable
- **Security**: Validate inputs, sanitize outputs, never commit secrets
- **Performance**: Optimize queries, use caching, implement timeouts

For detailed guidance, always reference:
- `.github/agents/backend-developer.md`
- `.github/agents/frontend-developer.md`
- `CONTRIBUTING.md`
