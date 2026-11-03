---
name: implementation-planner
description: Plan a feature or change in Eventuras and break it into agent-ready GitHub issues (goal, acceptance criteria, scope, how to verify). Use for multi-step or multi-domain work, or when turning a brief into issues.
---

# Implementation planner

Size the plan to the work. A one-day change needs a short task list, not phases and risk matrices.

## 1. Understand before planning

- Read the relevant code. Find existing patterns, services, components and tests to reuse.
- Write down your assumptions and open questions. Ask the maintainer about anything that changes the design.
  Guess only what's cheap to change later.

## 2. Plan

```markdown
# <Feature>

**Problem**: why we're doing this, in a sentence or two
**Done when**: observable outcome

## Approach
Key design decisions and the alternatives you rejected (one line each).
API contract changes (endpoint, DTO), schema changes (migration), UI changes.

## Tasks
1. [Max] API: … (S/M/L)
2. [Vix] Web: … (depends on 1)
3. [Vix] E2E: …

## Risks / out of scope
```

Sizes: **S** < 2h, **M** half a day, **L** 1–3 days. Split anything bigger.

Order tasks so each one merges on its own and leaves main green. Usually that means the API and migration first,
then the regenerated SDK, then the UI.

## 3. Agent-ready issues

An agent should be able to finish an issue without asking questions. One issue = one PR.

```markdown
## Goal
One or two sentences: what changes for whom.

## Acceptance criteria
- [ ] Concrete, checkable behaviour ("Admin sees …", "POST /v3/… returns 409 when …")
- [ ] Tests: which kind (unit / integration / e2e) and what they cover

## Scope
In: files/areas expected to change.
Out: what the agent must not touch.

## Context
Links to related code (`path/to/file.cs:42`), issues, docs. Patterns to copy.

## Verify
Commands to run (see the eventuras-testing skill), plus any manual check.
```

Create issues with `gh issue create --title "<type>(<scope>): …" --body-file … --label agent` plus an area label
(`area:registrations`, `area:orders`, `api`, …). Only do this once the maintainer has approved the plan.

## Team

Max (backend), Vix (frontend and e2e), Aria (architecture review), Cody (maintenance), Dora (docs).
