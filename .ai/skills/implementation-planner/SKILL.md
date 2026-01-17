---
name: implementation-planner
description: Creates detailed implementation plans and technical specifications in markdown format for features, architecture changes, and multi-phase projects
license: MIT
---

# Implementation Planner Skill

## Overview

This skill provides structured approaches for creating comprehensive implementation plans, technical specifications, and architecture documentation. Used by architects to plan complex features, coordinate multi-domain work, and provide clear roadmaps for development teams.

## When to Use This Skill

- Planning multi-phase features or projects
- Creating technical specifications for complex work
- Breaking down large initiatives into manageable tasks
- Coordinating work across multiple domains (frontend + backend + CMS)
- Documenting architecture decisions and technical approaches
- Providing implementation roadmaps for development teams

## Implementation Plan Structure

Adapt sections based on project complexity - smaller projects need less formality, larger projects benefit from more thorough planning.

### Basic Structure

```markdown
# [Feature/Project Name] Implementation Plan

## Overview
- **Problem**: What problem are we solving and why?
- **Success Criteria**: What does "done" look like?
- **Users**: Who will use this and how?
- **Impact**: What's the expected benefit or outcome?

## Technical Approach
- **Architecture**: High-level design and key components
- **Technology Choices**: Key decisions and rationale
- **Data Models**: Important data structures or schema changes
- **Integrations**: External services, APIs, or dependencies
- **Trade-offs**: Technical decisions and their implications

## Implementation Plan

Break work into logical phases. Phase duration depends on project size:
- Small projects: Days
- Medium projects: Weeks
- Large projects: Sprints or months

### Phase 1: Foundation
**Goal**: Establish core structure and dependencies

**Tasks**:
- [ ] Task 1 (Complexity: Small, Assigned: Backend Developer)
- [ ] Task 2 (Complexity: Medium, Dependencies: Task 1)
- [ ] Task 3 (Complexity: Large, Assigned: Frontend Architect)

**Deliverables**: What's ready at end of this phase?

### Phase 2: Core Functionality
**Goal**: Implement primary features and workflows

**Tasks**:
- [ ] Feature implementation (Complexity: Large)
- [ ] Business logic (Complexity: Medium)
- [ ] Integration work (Complexity: Medium, Dependencies: Phase 1 complete)

**Deliverables**: What's working end-to-end?

### Phase 3: Polish & Deploy
**Goal**: Finalize, test, and prepare for production

**Tasks**:
- [ ] Error handling and edge cases (Complexity: Medium)
- [ ] Testing (E2E, integration, unit) (Complexity: Large)
- [ ] Documentation and deployment (Complexity: Small)

**Deliverables**: Production-ready feature

## Considerations

### Assumptions
- What are we taking for granted?
- What needs to be validated before starting?

### Constraints
- **Time**: Deadlines or timeline requirements
- **Budget**: Resource limitations
- **Technical**: Platform or technology limitations
- **Team**: Available developers and expertise

### Risks & Mitigations
- **Risk 1**: [What could go wrong] → **Mitigation**: [How to prevent or handle it]
- **Risk 2**: [Potential issue] → **Mitigation**: [Backup plan]

## Out of Scope

Features or improvements intentionally excluded:
- Future enhancements saved for v2
- Nice-to-have items not essential for MVP
- Related features that would expand scope

## Success Metrics

How will we measure success after implementation?
- Performance targets (response time, throughput)
- User metrics (adoption, satisfaction)
- Business metrics (conversion, efficiency)
```

## Complexity Estimates

Use consistent complexity estimates across plans:

- **Small (S)**: 1-2 hours, straightforward work, no unknowns
- **Medium (M)**: 3-8 hours, some complexity or research needed
- **Large (L)**: 1-3 days, significant complexity or multiple components
- **Extra Large (XL)**: 4+ days, major feature or architectural change

## Task Assignment Guidelines

When assigning tasks to agents:

**Backend Work** → `@Backend API Developer`
- API endpoints, business logic, database migrations

**Frontend Architecture** → `@Frontend Architect`
- Library design, major refactoring, architectural decisions

**Frontend Implementation** → `@Frontend Developer`
- UI components, features, E2E tests

**CMS Planning** → `@Content Architect`
- Payload CMS patterns, content architecture

**Cross-Domain** → `@Project Architect`
- Multi-domain coordination, architecture oversight

## Examples for Different Project Sizes

### Small Project (1-3 days)

```markdown
# Add Export to CSV Feature

## Overview
- **Problem**: Users need to export event registrations as CSV
- **Success**: Download CSV with all registration data
- **Users**: Event administrators

## Approach
Add export endpoint and download button

## Tasks
1. Backend: CSV generation endpoint (M)
2. Frontend: Download button (S)
3. Testing: E2E test for export flow (S)

## Risks
- Large exports may timeout → Use streaming for 1000+ records
```

### Medium Project (1-2 weeks)

```markdown
# Implement Payment Integration

## Overview
[Full overview section]

## Technical Approach
- Vipps payment API integration
- Payment state management
- Webhook handling for async updates

## Implementation Plan

### Phase 1: Backend (3 days)
- [ ] Payment models and migrations (M)
- [ ] Vipps API client (L, @Backend Developer)
- [ ] Webhook endpoint (M)

### Phase 2: Frontend (2 days)
- [ ] Payment UI components (M, @Frontend Developer)
- [ ] Checkout flow (L, @Frontend Developer)
- [ ] Payment status display (S)

### Phase 3: Testing (2 days)
- [ ] E2E payment flow tests (L, @Frontend Developer)
- [ ] Integration tests (M, @Backend Developer)

## Considerations
[Full considerations section]
```

### Large Project (4+ weeks)

```markdown
# Multi-Tenant CMS Implementation

## Overview
[Comprehensive overview with business context]

## Technical Approach
- Payload CMS multi-tenant plugin
- Organization isolation at database level
- Shared and tenant-specific collections
- Access control per organization

## Implementation Plan

### Phase 1: Foundation (Week 1)
**Assigned**: @Project Architect, @Content Architect, @Backend Developer

[Detailed task breakdown]

### Phase 2: Core Collections (Week 2-3)
**Assigned**: @Content Architect, @Frontend Developer

[Detailed task breakdown]

### Phase 3: Access Control (Week 3-4)
**Assigned**: @Backend Developer, @Frontend Developer

[Detailed task breakdown]

### Phase 4: Testing & Migration (Week 4)
**Assigned**: All agents

[Detailed task breakdown]

## Considerations
[Comprehensive risk analysis, assumptions, constraints]

## Success Metrics
- Organizations can only access their own content
- Performance: <200ms for filtered queries
- Migration: Zero data loss from existing system
```

## Best Practices

### Planning Guidelines

1. **Start with "why"** - Clearly articulate the problem and expected outcome
2. **Break down complexity** - Divide large tasks into smaller, trackable units
3. **Identify dependencies** - Note what must happen before other work can start
4. **Assign ownership** - Clear accountability for each task or phase
5. **Document decisions** - Capture technical choices and reasoning
6. **Plan for risks** - Anticipate problems and define mitigations
7. **Define "done"** - Clear success criteria and deliverables

### Common Pitfalls to Avoid

- ❌ Vague tasks without clear scope ("Improve performance")
- ❌ Missing dependencies causing blockers
- ❌ Unrealistic timelines without buffer for unknowns
- ❌ No assignment leading to confusion about ownership
- ❌ Skipping risk analysis and getting surprised later
- ❌ Planning in too much detail too far ahead (vs. adaptive planning)

### Adaptive Planning

For longer projects:
- Plan Phase 1 in detail
- Plan Phases 2-3 at high level
- Refine later phases as you learn from earlier work
- Adjust based on actual complexity and findings

## Integration with Eventuras Monorepo

### Monorepo Considerations

When planning features in the Eventuras monorepo:

**Cross-App Features:**
- Identify which apps are affected (web, historia, api)
- Plan shared library extraction early if code will be reused
- Coordinate API contracts between frontend and backend

**Library Design:**
- Plan library APIs before implementation
- Consider future consumers beyond immediate need
- Document library usage patterns

**Testing Strategy:**
- E2E tests in `apps/web-e2e` for user flows
- Integration tests in `apps/api/tests` for backend
- Component tests for shared libraries

### File Organization

Implementation plans should be stored:
- **Multi-domain features**: `/docs/implementation-plans/[feature-name].md`
- **App-specific features**: `apps/[app]/docs/plans/[feature-name].md`
- **Library design**: `libs/[lib]/docs/design/[feature-name].md`

## Template Files

You can create reusable templates for common scenarios:

- `small-feature-template.md` - Simple feature additions
- `api-integration-template.md` - External service integrations
- `library-design-template.md` - New shared library planning
- `migration-template.md` - Data or system migrations

## Collaboration

Implementation plans facilitate:
- **Async communication** - Team members can review and comment
- **Progress tracking** - Check off completed tasks
- **Knowledge transfer** - New team members understand decisions
- **Retrospectives** - Compare actual vs. planned complexity

---

**This skill helps architects create clear, actionable plans that guide development teams from concept to completion.**
