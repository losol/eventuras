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

## Build, Test, and Development Commands

### Monorepo Commands (from root)
```bash
# Install all dependencies
pnpm install

# Build all applications and libraries
pnpm build

# Build only web app and its dependencies
pnpm build:dev

# Run all applications in development mode
pnpm dev

# Run web app and its dependencies
pnpm dev:web

# Lint all projects
pnpm lint

# Fix linting issues
pnpm lint:fix

# Run all tests
pnpm test

# Clean build artifacts
pnpm clean
```

### Frontend (apps/web)
```bash
cd apps/web

# Development server (http://localhost:3000)
pnpm dev

# Build for production
pnpm build

# Run production build
pnpm start

# Lint
pnpm lint

# Fix linting and format
pnpm lint:fix
```

### E2E Tests (apps/web-e2e)
```bash
cd apps/web-e2e

# Run all Playwright tests
pnpm test

# Run specific test file
pnpm playwright test playwright-e2e/admin-events.spec.ts

# Run in UI mode (for debugging)
pnpm playwright test --ui

# Show test report
pnpm playwright show-report
```

### Backend API (apps/api)
```bash
cd apps/api

# Restore .NET dependencies
dotnet restore

# Build the solution
dotnet build

# Run tests
dotnet test

# Run the API (development)
dotnet run --project src/Eventuras.WebApi

# Update OpenAPI schema (local API)
pnpm openapi:update

# Update OpenAPI schema (production API)
pnpm openapi:update:prod
```

### Shared Libraries (libs/*)
```bash
# Build specific library
pnpm --filter @eventuras/ratio-ui build

# Build all libraries
pnpm --filter "./libs/**" build

# Develop with watch mode (if supported)
pnpm --filter @eventuras/ratio-ui dev
```

## Testing Environment

### Database for Tests
When running in Copilot's environment (via GitHub Actions), a PostgreSQL database is automatically available:

- **Host**: `localhost`
- **Port**: `5432`
- **Database**: `eventuras_test`
- **Username**: `postgres`
- **Password**: `postgres`
- **Connection String**: `Host=localhost;Port=5432;Database=eventuras_test;Username=postgres;Password=postgres`

Use this connection string for backend integration tests. The database is automatically started before Copilot begins work (configured in `.github/copilot-setup-steps.yml`).

### Authentication for Tests

**Backend API (C# Tests):**
- Tests use **mock authentication** via helper methods
- No real authentication service needed
- Examples:
  ```csharp
  var client = _factory.CreateClient().AuthenticatedAsSystemAdmin();
  var client = _factory.CreateClient().AuthenticatedAs(user.Entity);
  var client = _factory.CreateClient().AuthenticatedAs(admin.Entity, Roles.Admin);
  var client = _factory.CreateClient().Authenticated(role: "Admin");
  ```
- Integration tests run with `appsettings.IntegrationTests.json` (no Auth config required)

**Frontend E2E Tests (Playwright):**
- Use setup projects: `admin.auth.setup.ts`, `user.auth.setup.ts`
- Authentication state is saved and reused across tests
- Configured in `playwright.config.ts` with test dependencies

## Important Context

- **Monorepo**: Uses pnpm workspaces and Turbo for build orchestration
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
