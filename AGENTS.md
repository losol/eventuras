# AGENTS.md

This file provides context and instructions for AI coding agents working on the Eventuras project [[5]](https://agents.md/).

## Project Overview

**Eventuras** is a comprehensive platform for managing courses, events, and conferences. It's built as a monorepo with specialized applications and shared libraries.

## Architecture

### Core Applications

1. **Backend API** (`apps/api`)
   - Language: C# .NET
   - Framework: ASP.NET Core
   - Database: PostgreSQL with Entity Framework Core
   - Purpose: RESTful API for course, event, and conference management

2. **Web Frontend** (`apps/web`)
   - Language: TypeScript
   - Framework: React 19+, Next.js 15+
   - Purpose: UI for participants and organizers

3. **Historia CMS** (`apps/historia`)
   - Language: TypeScript
   - Framework: React, Next.js
   - Purpose: Knowledge management system (in development)

4. **Converto API** (`apps/convertoapi`)
   - Language: TypeScript, Node.js
   - Framework: Fastify → Express.js (planned)
   - Purpose: HTML-to-PDF conversion microservice

5. **Shared Libraries** (`libs/`)
   - Language: TypeScript
   - Purpose: Reusable frontend components, utilities, and SDKs

## Agent Instructions

This project uses specialized agents for different contexts:

### Backend Agent
- **Scope**: `apps/api/`
- **File**: `.ai/agents/backend-agent.md`
- **Tech**: C# .NET, ASP.NET Core, Entity Framework Core, PostgreSQL
- **Focus**: API development, business logic, database migrations, external integrations

### Frontend Agent
- **Scope**: `apps/web/`, `apps/historia/`, `libs/`, `apps/web-e2e/`
- **File**: `.ai/agents/frontend-agent.md`
- **Tech**: TypeScript, React, Next.js, Tailwind CSS, Playwright
- **Focus**: UI development, shared libraries, E2E testing, refactoring to libs

### Converto Agent
- **Scope**: `apps/convertoapi/`
- **File**: `.ai/agents/converto-agent.md`
- **Tech**: TypeScript, Node.js, Fastify/Express, Playwright
- **Focus**: PDF generation, microservice architecture, API design

## Development Environment Tips

### Monorepo Navigation
