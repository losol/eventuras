# Eventuras AI Agents

> **⚡ Quick Navigation:** Agent specifications are in [`.github/agents/`](../.github/agents/). This is a quick reference guide.

## 🎯 Agent Directory

### Strategic & Coordination

- **[🎯 Project Architect](../.github/agents/project-architect.md)** - Multi-domain coordination, issue management, architecture oversight
- **[🏗️ Frontend Architect](../.github/agents/frontend-architect.md)** - Frontend architecture, library design, pattern establishment
- **[📝 Content Architect](../.github/agents/content-architect.md)** - Historia CMS planning and architecture

### Development & Implementation

- **[✨ Frontend Developer](../.github/agents/frontend-developer.md)** - UI implementation, E2E testing, feature development
- **[⚙️ Backend Developer](../.github/agents/backend-developer.md)** - C# .NET API development, business logic, database operations
- **[🔧 Converto Developer](../.github/agents/converto-developer.md)** - PDF generation microservice

### Maintenance & Documentation

- **[🧹 Maintenance Specialist](../.github/agents/maintenance-specialist.md)** - Code cleanup, refactoring, dependency updates
- **[📝 Documentation Specialist](../.github/agents/documentation-specialist.md)** - README files, guides, documentation organization

---

## 📊 Quick Reference

| Agent | Primary Use | Scope | Key Skills |
|-------|-------------|-------|------------|
| **Project Architect** | Multi-domain features, issue tracking | Entire monorepo | Coordination, planning, architecture review |
| **Frontend Architect** | Library design, architectural decisions | Frontend apps & libs | Architecture, API design, patterns |
| **Frontend Developer** | Features, components, tests | `apps/web`, `apps/historia`, `libs/` | UI development, testing, implementation |
| **Backend Developer** | API endpoints, business logic | `apps/api` | C#, EF Core, API design, testing |
| **Content Architect** | CMS planning | `apps/historia` | Payload CMS, planning, research |
| **Converto Developer** | PDF generation | `apps/convertoapi` | Playwright, Node.js, microservices |
| **Maintenance Specialist** | Cleanup, updates | All code & docs | Refactoring, dependency management |
| **Documentation Specialist** | READMEs, guides | Documentation files | Technical writing, organization |

---

## 🚀 How to Choose an Agent

### "I need to..."

**Build a new feature:**
- Single domain? → Use domain specialist (Frontend/Backend/Converto Developer)
- Multiple domains? → Start with **Project Architect**

**Fix architecture or design:**
- Frontend architecture? → **Frontend Architect**
- Multi-domain architecture? → **Project Architect**
- CMS architecture? → **Content Architect**

**Clean up or update:**
- Code cleanup, remove duplicates? → **Maintenance Specialist**
- Dependency updates? → **Maintenance Specialist**
- Documentation cleanup? → **Documentation Specialist** or **Maintenance Specialist**

**Write or update documentation:**
- README, CONTRIBUTING? → **Documentation Specialist**
- API docs in code? → Use domain specialist

**Plan a complex feature:**
- CMS feature? → **Content Architect** (creates plan)
- Multi-domain feature? → **Project Architect** (coordinates)
- Library or architecture? → **Frontend Architect** (designs approach)

---

## 🔗 Related Documentation

- **[Full Agent README](README.md)** - Comprehensive guide with decision trees and collaboration patterns
- **[Agent Context](../../AGENTS.md)** - Project-level agent overview
- **[Global Instructions](../../.github/copilot-instructions.md)** - Copilot configuration

### Skills & Instructions

- **[Skills](../skills/)** - Specialized capabilities (testing, planning)
- **[Instructions](../instructions/)** - Context-aware guidelines that auto-apply

---

## 📋 Agent Features

All agents include:

- ✅ Clear scope and responsibilities
- ✅ Skills in YAML frontmatter
- ✅ Cross-agent collaboration guidelines
- ✅ "When to use" guidance
- ✅ Skill maintenance responsibilities

---

## 🎓 Learning More

1. **New to the project?** Start with [AGENTS.md](../../AGENTS.md) for project overview
2. **Looking for an agent?** Use the Quick Reference table above
3. **Need detailed guidance?** Read the [Full Agent README](README.md)
4. **Working on specific code?** Check if [instructions](../instructions/) auto-apply to your file type

---

**Last Updated:** January 2026
