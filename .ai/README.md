# Eventuras AI Development System

> **Central hub for AI agents, instructions, and skills in the Eventuras monorepo**

## 📂 Directory Structure

```
.ai/
├── README.md                    # ← You are here
├── AGENTS.md                    # Quick agent directory and reference
│
├── agents/                      # Agent resources (specs in .github/agents/)
│   ├── README.md               # Agent directory with links
│   └── FULL_GUIDE.md           # Comprehensive agent guide
│
├── instructions/                # Context-aware guidelines
│   ├── backend-services.instructions.md
│   ├── playwright-tests.instructions.md
│   └── ui-components.instructions.md
│
└── skills/                      # Specialized capabilities
    ├── eventuras-testing/       # Testing commands & patterns
    └── implementation-planner/  # Planning methodology
```

## 🎯 Quick Start

### For Developers

**Need help with a task?** Check [AGENTS.md](AGENTS.md) for a quick agent directory.

**Working on specific code?** Instructions auto-apply based on file patterns:
- `apps/api/src/**/*.cs` → [backend-services.instructions.md](instructions/backend-services.instructions.md)
- `**/playwright-e2e/**/*.spec.ts` → [playwright-tests.instructions.md](instructions/playwright-tests.instructions.md)
- `libs/ratio-ui/**/*.{ts,tsx}` → [ui-components.instructions.md](instructions/ui-components.instructions.md)

### For AI Agents

**New to this codebase?** Read [agents/README.md](agents/README.md) for comprehensive guidance.

**Looking for capabilities?** Check [skills/](skills/) for specialized knowledge.

## 📋 Components

### Agents

Specialized AI personas with distinct roles and expertise.

**Full specifications**: [`.github/agents/`](../.github/agents/)  
**Summary and guides**: [agents/README.md](agents/README.md)

- **Architects** - Strategic planning and design
- **Developers** - Tactical implementation
- **Specialists** - Maintenance and documentation

### Instructions

Context-aware guidelines that automatically apply when editing specific file types:

- Auto-load based on file path patterns
- Provide detailed coding standards
- Include best practices and anti-patterns

[→ Browse instructions](instructions/)

### Skills

Reusable capabilities that agents can leverage:

- Testing commands and patterns
- Implementation planning templates
- Specialized knowledge domains

[→ Explore skills](skills/)

## 🔗 External Documentation

- **[AGENTS.md](../AGENTS.md)** - Project-level agent overview
- **[.github/copilot-instructions.md](../.github/copilot-instructions.md)** - Global Copilot configuration
- **[CONTRIBUTING.md](../CONTRIBUTING.md)** - Contribution guidelines

## 🎓 How It All Works Together

```
1. User makes a request
   ↓
2. Appropriate agent is selected (based on task)
   ↓
3. Agent context loads (role, responsibilities, skills)
   ↓
4. Instructions auto-apply (based on file patterns)
   ↓
5. Skills provide specialized knowledge
   ↓
6. Agent produces high-quality output
```

## ✨ Features

- **🎯 Clear separation of concerns** - Each agent has distinct expertise
- **🔄 Cross-agent collaboration** - Agents consult each other when needed
- **📚 Context-aware** - Instructions apply automatically
- **🧠 Skill-based** - Reusable capabilities across agents
- **📖 Well-documented** - Comprehensive guides and examples

---

**Agent specs**: See [`.github/agents/`](../.github/agents/) • **Guide**: [agents/FULL_GUIDE.md](agents/FULL_GUIDE.md)
