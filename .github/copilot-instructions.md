# GitHub Copilot Instructions for Eventuras

## Project Overview

Eventuras is a platform for managing courses, events, and conferences. This monorepo contains:

- **apps/api**: C# .NET backend API (ASP.NET Core + PostgreSQL)
- **apps/web**: Next.js frontend for participants and organizers
- **apps/historia**: Next.js knowledge management CMS (in development)
- **apps/convertoapi**: Node.js PDF generation microservice
- **libs/**: Shared TypeScript libraries for frontend

## Context-Aware Assistance

### When working in `apps/api/` (C# Backend)
- **Language**: C#
- **Framework**: ASP.NET Core (latest LTS)
- **Database**: PostgreSQL with Entity Framework Core
- **Patterns**: Clean architecture, dependency injection, repository pattern
- **Testing**: xUnit for unit and integration tests
- **Documentation**: XML comments for public APIs

Key principles:
- Use async/await for I/O operations
- Keep controllers thin, move logic to services
- Follow SOLID principles
- Validate inputs, use DTOs for API models

See detailed guidelines: `.ai/agents/backend-agent.md`

### When working in `apps/web/`, `apps/historia/`, or `libs/` (TypeScript Frontend)
- **Language**: TypeScript 5+
- **Framework**: React 19+, Next.js 15+ (App Router)
- **Styling**: Tailwind CSS 4+
- **UI Components**: React Aria Components
- **Testing**: Playwright (E2E)
- **Documentation**: TSDoc for exported functions

Key principles:
- Use TypeScript strict mode
- Prefer function components and hooks
- Extract reusable code to `libs/`
- Use Server Components by default, `'use client'` only when needed
- Implement responsive design and accessibility

See detailed guidelines: `.ai/agents/frontend-agent.md`

### When working in `apps/convertoapi/` (Node.js Microservice)
- **Language**: TypeScript
- **Framework**: Fastify (→ Express.js migration planned)
- **PDF Generation**: Playwright
- **Auth**: JWT-based

Key principles:
- Keep business logic framework-agnostic
- Implement proper error handling and timeouts
- Validate inputs with Zod schemas
- Handle browser resource cleanup

See detailed guidelines: `.ai/agents/converto-agent.md`

## Code Standards

### Commits
- Use [Conventional Commits](https://www.conventionalcommits.org/)
- Format: `type(scope): description`
- Types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`
- Examples:
  - `feat(api): add event registration endpoint`
  - `fix(web): correct date formatting in event card`
  - `refactor(ui): extract button component to libs`

### Naming Conventions

**C#:**
- Classes/Methods: `PascalCase`
- Private fields: `_camelCase`
- Interfaces: `IPascalCase`

**TypeScript:**
- Components: `PascalCase`
- Functions/hooks: `camelCase`
- Files: `kebab-case` (utilities) or `PascalCase` (components)
- Types/Interfaces: `PascalCase`

## Important Context

- **Monorepo**: Uses npm workspaces and Turbo for build orchestration
- **Frontend Libraries**: Actively refactor duplicated code from apps to `libs/`
- **Testing**: Write E2E tests for critical user flows in `apps/web-e2e`
- **Documentation**: Each agent is responsible for documenting their own code
- **Contributing**: See `CONTRIBUTING.md` for workflow (commit daily, PRs early)

## Security & Performance

- Validate all user inputs
- Never commit secrets (use environment variables)
- Optimize images (use Next.js Image component)
- Implement proper error handling and logging
- Use rate limiting for public APIs

For detailed instructions, always refer to the agent-specific files in `.ai/agents/`.
