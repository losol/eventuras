# Eventuras AI Agents

This directory contains specialized AI agents for developing the Eventuras platform. Each agent has domain expertise and clear responsibilities to ensure consistent, high-quality code.

## 📋 Table of Contents

- [Agent Overview](#agent-overview)
- [When to Use Which Agent](#when-to-use-which-agent)
- [Agent Collaboration](#agent-collaboration)
- [Instructions System](#instructions-system)
- [Best Practices](#best-practices)

## Agent Overview

### � Project Architect (`project-architect.md`)

**Role:** Strategic coordination for multi-domain features and project management

**Use for:**
- Multi-domain features (spanning frontend + backend + CMS)
- Architecture coordination across the monorepo
- Creating and updating GitHub issues
- Task assignment and progress tracking
- Architecture reviews for consistency

**Scope:** All apps, all libs, GitHub issues and project management

**Key Distinction:** Coordinates specialists, doesn't replace them

---

### �🏗️ Frontend Architect (`frontend-architect.md`)

**Role:** Strategic technical leadership for frontend architecture

**Use for:**
- Architecture decisions (creating new libraries, structuring features)
- Library API design and contracts
- Establishing coding patterns and standards
- Performance architecture and optimization
- Major refactoring strategies

**Scope:** `apps/web`, `apps/historia`, `libs/*` (architecture)

---

### ✨ Frontend Developer (`frontend-developer.md`)

**Role:** Tactical implementation of frontend features

**Use for:**
- Building features and UI components
- Writing E2E tests with Playwright
- Bug fixes and maintenance
- Day-to-day development following established patterns
- Contributing to existing libraries

**Scope:** `apps/web`, `apps/historia`, `apps/web-e2e`, `libs/*` (usage)

---

### ⚙️ Backend API Developer (`backend-specialist.md`)

**Role:** Senior C# .NET developer for API development

**Use for:**
- Creating and modifying API endpoints
- Implementing business logic and services
- Database migrations and queries
- Writing backend tests (xUnit)
- Authentication and authorization
- Performance optimization

**Scope:** `apps/api` (all C# .NET backend services)

---

### 📝 Content Architect (`cms-planning-agent.md`)

**Role:** Planning agent for Historia CMS development

**Use for:**
- Researching and planning Historia CMS features
- Creating detailed implementation plans
- Establishing Payload CMS patterns
- Content management architecture

**Scope:** `apps/historia` (planning only, not implementation)

**Note:** This is a **planning agent** - it creates plans, not code. Hand off to implementation agents.

---

### 🔧 Backend API Developer (`backend-api-developer.md`)

**Role:** Backend API implementation and maintenance

**Scope:** `apps/api`

---

### 📝 Documentation Specialist (`documentation-specialist.md`)

**Role:** Creates and maintains README files and project documentation

**Use for:**
- Writing and updating README.md files
- Creating CONTRIBUTING.md and other guides
- Organizing documentation structure
- Ensuring docs follow monorepo conventions (app-specific in app folders, monorepo-wide in `/docs/`)

**Scope:** All documentation files (`.md`, `.txt`)

**Note:** Only works with documentation files - does not modify code or code-embedded documentation.

---

### 🧹 Maintenance Specialist (`maintenance-specialist.md`)

**Role:** Code cleanup, refactoring, and dependency management

**Use for:**
- Removing dead code, duplicates, and unused imports
- Simplifying complex logic and improving code quality
- Updating packages and dependencies across the monorepo
- Consolidating repeated code into shared utilities
- Cleaning up stale documentation

**Scope:** All code and documentation files, `package.json`, dependency files

**Note:** Focuses on non-feature work - does not implement new features.

---

## When to Use Which Agent

### Multi-Domain or Complex Features

```
┌─────────────────────────────────────┐
│ Does this span multiple domains?    │
│ (frontend + backend + CMS)          │
└──────────┬──────────────────────────┘
           │
     Yes ──┼── No (single domain)
           │
    Project         Use specialist
    Architect       (see below)
```

**Examples:**
- "Add payment processing feature" → **Project Architect** (coordinates all domains)
- "Implement SSO authentication" → **Project Architect** (frontend + backend + CMS)
- "Create issue for user profile feature" → **Project Architect** (issue management)

### Frontend Work

```
┌─────────────────────────────────────┐
│ Is this an architectural decision?  │
│ (new library, major refactor, API)  │
└──────────┬──────────────────────────┘
           │
     Yes ──┼── No
           │
    Frontend      Frontend
    Architect     Developer
```

**Examples:**
- "Should we extract this to a library?" → **Frontend Architect**
- "Build a login form component" → **Frontend Developer**
- "Design the API for our new auth library" → **Frontend Architect**
- "Fix the header navigation bug" → **Frontend Developer**

### Backend Work

```
┌─────────────────────────────────────┐
│ Working with C# .NET API?           │
└──────────┬──────────────────────────┘
           │
          Yes
           │
    Backend API Developer
```

**Examples:**
- "Create a new registration endpoint" → **Backend API Developer**
- "Add validation to event creation" → **Backend API Developer**
- "Fix SQL query performance" → **Backend API Developer**

### CMS Work

```
┌─────────────────────────────────────┐
│ PlProject Architect Consults:

- **All Specialists** → For multi-domain feature coordination
- **Frontend Architect** → Frontend architecture decisions affecting system
- **Backend Specialist** → API contracts and data flow
- **Content Architect** → CMS integration planning

### anning or implementing?           │
└──────────┬──────────────────────────┘
           │
  Planning ┼── Implementing
           │
    Content        Frontend Developer
    Architect      (for Historia features)
```

**Examples:**
- "Plan a multi-tenant content system" → **Content Architect**
- "Implement the article editor UI" → **Frontend Developer**

### Documentation Work

```
┌─────────────────────────────────────┐
│ Working with documentation files?   │
│ (README, CONTRIBUTING, guides)      │
└──────────┬──────────────────────────┘
           │
          Yes
           │
    Documentation
    Specialist
```

**Examples:**
- "Create a README for the new library" → **Documentation Specialist**
- "Update the contributing guide" → **Documentation Specialist**
- "Fix broken links in documentation" → **Documentation Specialist**
- "Reorganize docs to follow monorepo conventions" → **Documentation Specialist**

**Note:** For API documentation in code, use domain specialists instead.

### Maintenance Work

```
┌─────────────────────────────────────┐
│ Is this cleanup or dependency work? │
│ (not a new feature)                 │
└──────────┬──────────────────────────┘
           │
          Yes
           │
    Maintenance
    Specialist
```

**Examples:**
- "Remove dead code from the auth module" → **Maintenance Specialist**
- "Update all npm packages to latest" → **Maintenance Specialist**
- "Consolidate duplicate date formatting functions" → **Maintenance Specialist**
- "Update React to v19 across the monorepo" → **Maintenance Specialist**
- "Clean up unused imports" → **Maintenance Specialist**
- "Simplify complex nested conditionals" → **Maintenance Specialist**

---

## Agent Collaboration

Agents are designed to consult each other when needed:

### Frontend Developer Consults:

- **Frontend Architect** → Architecture decisions, library design, major refactoring
- **Backend API Developer** → API integration, data structures, backend behavior
- **Content Architect** → Historia CMS features and patterns

### Frontend Architect Consults:

- **Backend Specialist** → API contracts, data flow, performance implications
- **Frontend Developer** → Validating patterns work in practice, API usability
- **Content Architect** → Historia architecture and Payload CMS patterns

### Backend API Developer Consults:

- **Frontend Architect** → API design impact on frontend, data structure decisions
- **Frontend Developer** → API usability, frontend requirements
- **Content Architect** → CMS backend integration

### Content Architect Consults:

- **Frontend Architect** → Frontend architecture for CMS features
- **Frontend Developer** → Implementation feasibility
- **Backend API Developer** → API integration with CMS

**How to Reference:**
Use `@AgentName` to mention another agent in your prompts or conversations.

---

## Instructions System

In addition to agents, Eventuras uses **context-aware instruction files** that automatically apply when working on specific file types.

### 📂 Location: `.ai/instructions/`

### Available Instructions:

#### 1. **Backend Services** (`backend-services.instructions.md`)

```yaml
applyTo: "apps/api/src/**/*.cs"
```

**Automatically loads when editing C# files in the backend.**

**Covers:**
- Architecture (controllers, services, domain, infrastructure)
- Coding standards (naming, async/await, DI)
- Controller and service patterns
- Testing guidelines (unit, integration)
- Error handling and logging
- Documentation (XML comments)

#### 2. **Playwright Tests** (`playwright-tests.instructions.md`)

```yaml
applyTo: "**/playwright-e2e/**/*.spec.ts"
```

**Automatically loads when writing E2E tests.**

**Covers:**
- Test structure and organization
- Locator strategies (semantic locators)
- Authentication and setup projects
- Best practices (isolation, auto-wait, assertions)
- Common patterns and anti-patterns

#### 3. **UI Components** (`ui-components.instructions.md`)

```yaml
applyTo: "libs/ratio-ui/**/*.{ts,tsx}"
```

**Automatically loads when working on shared UI components.**

**Covers:**
- Component structure and patterns
- Styling with Tailwind CSS
- Accessibility requirements (ARIA, semantic HTML)
- TypeScript typing and exports
- Storybook documentation
- Testing approaches

---

## How Agents and Instructions Work Together

```
┌──────────────────────┐
│   User Request       │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  Select Agent        │  ◄─── Based on task type
│  (e.g., Frontend Dev)│       and scope
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  Agent Context       │  ◄─── Agent's guidelines,
│  (Agent .md file)    │       responsibilities,
└──────────┬───────────┘       collaboration rules
           │
           ▼
┌──────────────────────┐
│  Instruction Files   │  ◄─── Auto-apply based on
│  (Auto-loaded)       │       file path/pattern
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  Code Generation     │  ◄─── Agent uses all context
│  or Guidance         │       to produce high-quality
└──────────────────────┘       output
```

**Example Workflow:**

1. **User:** "Fix the event card component in ratio-ui"
2. **Agent Selected:** Frontend Developer
3. **Agent Context Loaded:** Frontend Developer guidelines
4. **Instructions Auto-Loaded:** `ui-components.instructions.md` (matches `libs/ratio-ui/**/*.tsx`)
5. **Result:** Agent has full context about component patterns, accessibility, TypeScript, etc.

---

## Creating Custom Skills

Skills extend agent capabilities with specialized knowledge or tools. Each agent declares its skills in YAML frontmatter, helping GitHub Copilot route requests appropriately.

### Skill Structure

Skills are defined in `SKILL.md` files with YAML frontmatter:

```markdown
---
name: webapp-testing
description: Automated testing strategies for web applications
license: MIT
---

# Web Application Testing Skill

[Your skill instructions, examples, and guidelines here]
```

### Skill Locations

**Project Skills** (specific to Eventuras):
- `.ai/skills/` or `.claude/skills/`
- Example: `.ai/skills/eventuras-api-testing/SKILL.md`

**Personal Skills** (shared across projects):
- `~/.copilot/skills/` or `~/.claude/skills/`
- Example: `~/.copilot/skills/security-audit/SKILL.md`

### Creating a New Skill

1. **Create skill directory:**
   ```bash
   mkdir -p .ai/skills/eventuras-testing
   ```

2. **Create SKILL.md file:**
   ```markdown
   ---
   name: eventuras-testing
   description: Testing patterns for Eventuras monorepo (Playwright E2E, xUnit, integration tests)
   license: MIT
   ---

   # Eventuras Testing Skill

   ## Overview
   Specialized testing patterns for the Eventuras platform...

   ## Playwright E2E Testing
   - Authentication setup projects
   - Page object patterns
   - Semantic locators

   ## Backend Testing
   - xUnit patterns
   - Integration test setup
   - Mock authentication helpers
   ```

3. **Add supporting files (optional):**
   ```
   .ai/skills/eventuras-testing/
   ├── SKILL.md
   ├── scripts/
   │   └── setup-test-db.sh
   └── examples/
       ├── e2e-test-example.ts
       └── integration-test-example.cs
   ```

4. **Reference in agent frontmatter:**
   ```yaml
   ---
   name: Frontend Developer
   skills:
     - code-generation
     - testing
     - eventuras-testing  # Custom skill
   ---
   ```

### Skill Naming Conventions

- **Lowercase** with hyphens for spaces
- Match the directory name to the `name` in frontmatter
- Be specific: `webapp-testing` not just `testing`
- Use project prefix for project-specific skills: `eventuras-api-patterns`

### When to Create a Skill

Create a custom skill when:
- ✅ Knowledge is highly specialized or domain-specific
- ✅ You need to bundle scripts, examples, or resources
- ✅ The pattern is reused across multiple files/contexts
- ✅ Instructions alone aren't sufficient (need executable tools)

Don't create a skill when:
- ❌ Context-aware instructions (`.instructions.md`) would suffice
- ❌ The knowledge is general programming best practices
- ❌ It's a one-time or single-file concern

### Examples of Good Skills for Eventuras

- `eventuras-monorepo`: Managing pnpm workspace, Turbo builds, cross-package dependencies
- `payload-cms-patterns`: Payload CMS specific patterns for Historia
- `dotnet-ef-migrations`: Entity Framework Core migration patterns for our PostgreSQL setup
- `eventuras-api-testing`: Full-stack testing patterns (E2E + integration + unit)

---

## Best Practices

### For Users:

1. **Choose the right agent** - Use the decision trees above
2. **Be specific** - Include file paths, feature names, or context
3. **Mention collaborators** - Use `@AgentName` when cross-domain work is needed
4. **Trust the system** - Instructions auto-load, you don't need to mention them

### For Agents:

1. **Stay in scope** - Know your boundaries and refer to other agents when needed
2. **Consult peers** - Use cross-agent collaboration for cross-cutting concerns
3. **Follow instructions** - Context-aware instructions provide detailed guidance
4. **Document decisions** - Explain architectural choices, especially for Frontend Architect
5. **Maintain skills** - Keep your domain's skill files current when discovering new patterns or better practices

### For Contributors:

1. **Update agents** - Keep agent files current when responsibilities change
2. **Enhance instructions** - Add patterns and anti-patterns as they emerge
3. **Maintain separation** - Agents = roles/responsibilities, Instructions = detailed rules
4. **Test collaboration** - Ensure agents reference each other appropriately
5. **Update skills** - Each agent is responsible for maintaining their domain's skills as patterns evolve

---
project-architect.md         # 🎯 Multi-domain coordination & PM
│   ├── 
## Directory Structure

```
.github/
├── agents/                          # AI agent definitions
│   ├── README.md                    # This file
│   ├── project-architect.md         # 🎯 Multi-domain coordination & PM
│   ├── frontend-architect.md        # 🏗️ Frontend architecture leadership
│   ├── frontend-developer.md        # ✨ Frontend feature implementation
│   ├── backend-developer.md         # ⚙️ Backend API development
│   ├── content-architect.md         # 📝 Historia CMS planning
│   ├── documentation-specialist.md  # 📝 Documentation and README files
│   └── maintenance-specialist.md    # 🧹 Code cleanup and dependency updates
│
├── instructions/                    # Context-aware instruction files
│   ├── backend-services.instructions.md      # Auto-applies to apps/api/src/**/*.cs
│   ├── playwright-tests.instructions.md      # Auto-applies to **/playwright-e2e/**/*.spec.ts
│   └── ui-components.instructions.md         # Auto-applies to libs/ratio-ui/**/*.{ts,tsx}
│
└── skills/                          # Custom skill definitions
    ├── eventuras-testing/           # Testing skill for monorepo
    │   └── SKILL.md
    └── implementation-planner/      # Implementation planning methodology
        └── SKILL.md
```

---

## Contributing

When adding or modifying agents:

1. Define clear scope and responsibilities
2. Add cross-agent collaboration guidelines
3. Include examples of when to use vs. when to defer
4. Update this README with the new agent

When adding or modifying instructions:

1. Use clear `applyTo` glob patterns
2. Include both patterns (✅ good) and anti-patterns (❌ avoid)
3. Provide code examples
4. Keep focused on specific file types or contexts

---

## Questions?

See also:
- `AGENTS.md` - Project-wide agent context and guidelines
- `.github/copilot-instructions.md` - Global Copilot instructions
- Individual agent files for detailed responsibilities

---

**Last Updated:** January 2026
