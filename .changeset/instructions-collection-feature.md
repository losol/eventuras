---
"@eventuras/historia": minor
---

Add Instructions Collection for procedural content

Implements a new Instructions collection (slug: `instructions`) using a story-based block architecture for flexible procedural and instructional content:

**New Blocks:**
- **ResourcesBlock**: Unified block for materials and tools (differentiated by type field)
  - Supports localized names, descriptions, quantities, and units
  - Section-specific or top-level placement
- **InstructionBlock**: Individual instruction steps
  - Optional images with rich text captions
  - Localized titles and content
- **InstructionSection**: Hierarchical grouping of instructions and resources
  - Nested block support for organized multi-phase procedures

**Features:**
- Story-based architecture reusing proven `storyField()` pattern
- Full localization support for all text fields
- Live preview and draft/publish workflow
- Automatic cache invalidation on publish
- SEO metadata and Open Graph support
- Import/export capability

**Use Cases:**
- Cooking recipes with ingredients and steps
- Assembly instructions with required tools
- IT procedures and test plans
- How-to guides and tutorials

The flexible block model allows editors to create flat instruction lists, nested sections, or mixed narrative + procedural content. Shopping list aggregation can be performed by filtering ResourcesBlocks by type.

See ADR 0010 for architectural decisions and implementation details.
