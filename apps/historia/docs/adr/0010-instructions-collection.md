# ADR 0010 — Instructions Collection for Procedural Content

## Status
Accepted

## Context

Historia needs a domain-agnostic way to model instructional and procedural content across multiple use cases:
- Cooking and baking recipes
- Assembly and building instructions
- IT test plans and operational procedures
- How-to guides and tutorials

The MVP focus is to establish:
- A stable and composable content structure
- A good authoring experience in Payload CMS
- Clear separation between resources (what you need) and instructions (what you do)
- Minimal abstraction with a clear path for future extensions

### Inspiration from Existing Patterns

**Historia's Story Block Pattern:**
The existing `storyField()` provides a proven pattern for composable content:
- Used successfully in Articles, Pages, and Cases collections
- Provides flexible block-based content with drag-and-drop reordering
- Mature admin UI with good editor experience
- Automatic type generation and rendering infrastructure

**Happenings Collection Pattern:**
The `happenings` collection demonstrates hierarchical structure:
- Top-level context fields (title, lead, image)
- Story field for narrative content
- Program field (blocks) for structured event content
- Clean separation of concerns

### Key Design Question

How to structure procedural content in Payload CMS that:
- Leverages proven storyField infrastructure
- Supports both flat and nested instruction structures
- Allows mixing narrative and procedural content
- Enables easy querying (e.g., shopping list aggregation)
- Provides flexibility without complexity

## Decision

Create an **Instructions collection** (slug: `instructions`) using the story-based pattern:
- **Story field** contains all content as composable blocks
- **ResourcesBlock** for materials and tools (unified via type field)
- **InstructionBlock** for individual instruction steps
- **InstructionSection** for grouping instructions and section-specific resources
- **Content block** (existing) for narrative intro, tips, and notes

### Content Model

```
Instructions Collection
├── title (text, localized)
├── lead (richText, localized)
├── image (group: media + caption)
└── story (blocks)
    └── Available block types:
        ├── ResourcesBlock
        │   ├── title (text, e.g., "For dough", "Required Tools")
        │   ├── type (select: 'materials' | 'tools')
        │   ├── description (richText, localized, optional)
        │   └── items (array)
        │       ├── name (text, required, localized)
        │       ├── description (richText, optional)
        │       ├── resourceRef (relationship to 'resources', future)
        │       ├── quantity (text, optional)
        │       └── unit (text, optional)
        │
        ├── InstructionBlock
        │   ├── title (text, required, localized)
        │   ├── image (group: media + caption, optional)
        │   └── content (richText, localized, optional)
        │
        ├── InstructionSection
        │   ├── title (text, required, localized)
        │   ├── description (richText, localized, optional)
        │   └── sectionContent (blocks)
        │       └── Can contain: ResourcesBlock, InstructionBlock
        │
        └── Content (existing Historia block)
            └── richText (for narrative intro, tips, notes)
```

### Authoring Experience

**Top-Level Fields:**
- Editors define title, lead (summary), and hero image
- Standard Historia pattern for basic metadata

**Story Blocks (Composable Content):**
- Editors build content by adding blocks in any order
- ResourcesBlock for materials or tools (type field differentiates)
- InstructionBlock for individual steps
- InstructionSection for grouping related instructions
- Content block for narrative text, tips, warnings

**Flexible Structure:**
- **Flat structure** - Add ResourcesBlock + multiple InstructionBlocks directly
- **Nested structure** - Use InstructionSection with nested resources and steps
- **Mixed content** - Combine narrative (Content) with procedural blocks
- **Section-specific resources** - Add ResourcesBlock inside InstructionSection for "just-in-time" materials

### Frontend Flexibility

The story-based structure enables multiple presentation modes:

**Shopping List Aggregation:**
```typescript
// Aggregate all materials across story
const allMaterials = instruction.story
  .filter(block => block.blockType === 'resourcesBlock' && block.type === 'materials')
  .flatMap(block => block.items);

// Get all tools
const allTools = instruction.story
  .filter(block => block.blockType === 'resourcesBlock' && block.type === 'tools')
  .flatMap(block => block.items);
```

**Section-specific Resources:**
```typescript
// Get materials for a specific section
const prepStepResources = instruction.story
  .find(b => b.blockType === 'instructionSection' && b.title === 'Preparation')
  ?.sectionContent
  ?.filter(b => b.blockType === 'resourcesBlock');
```

**Progressive Disclosure:**
- Frontend can show complete overview (all resources upfront)
- Or progressive sections (resources shown per section)
- Interactive checklist (user tracks progress)

This separation of authoring structure (admin UX) from presentation (frontend UX) is intentional.

## Rationale

### Why Story Field

- ✅ **Proven pattern** - Already successful in Articles, Pages, Cases
- ✅ **Mature infrastructure** - RenderBlocks, type generation, admin UI
- ✅ **Single content flow** - Editors work in one unified area
- ✅ **Flexible composition** - Flat, nested, or mixed structures
- ✅ **Reordering** - Full drag-and-drop freedom
- ✅ **No migration** - Adding new block types doesn't require data migration

### Why Unified ResourcesBlock

- ✅ **DRY principle** - One block instead of separate Materials/Tools blocks
- ✅ **Type field** - Simple select differentiates materials vs tools
- ✅ **Consistent structure** - Same fields for both resource types
- ✅ **Flexible placement** - Can be top-level or section-specific
- ✅ **Easy querying** - Filter by type field for aggregation

### Why InstructionBlock (Not Arrays)

- ✅ **Visual prominence** - Each step is a distinct block in admin UI
- ✅ **Rich content** - Image + richText per step
- ✅ **Consistent with story** - Same block pattern throughout
- ✅ **Reorderable** - Drag-and-drop between sections
- ✅ **Future extensibility** - Easy to add templates, duration, etc.

### Why InstructionSection

- ✅ **Logical grouping** - Maps to real-world procedural phases
- ✅ **Nested resources** - Section-specific materials/tools
- ✅ **Optional** - Simple instructions can skip sections entirely
- ✅ **Composable** - Sections can contain both resources and instructions

### Why Not Separate Fields for Materials/Tools

- ❌ **Multiple content areas** - Forces editors to jump between fields
- ❌ **Fixed structure** - Can't intersperse narrative with procedural
- ❌ **Less flexible** - Top-level only, no section-specific resources
- ❌ **More complex queries** - Need to access multiple field paths

## Consequences

### Positive

- ✅ **Reuses proven infrastructure** - storyField, RenderBlocks, type generation
- ✅ **Flexible authoring** - Editors choose flat, nested, or mixed structures
- ✅ **Simple data model** - 3 new blocks vs. separate field hierarchies
- ✅ **Easy shopping list** - Simple filter + flatMap for aggregation
- ✅ **Section-specific resources** - "Just-in-time" material lists
- ✅ **Mixed content** - Narrative and procedural seamlessly combined
- ✅ **Future-proof** - New block types add features without migration
- ✅ **Consistent UX** - Same block editing experience across Historia

### Trade-offs

- ⚠️ **Query complexity** - Must traverse block structure vs. direct field access
- ⚠️ **Shopping list not explicit** - Frontend must aggregate from blocks
- ⚠️ **Block count** - Many steps = long story field (mitigated by sections)
- ⚠️ **Less structured** - Editors have more freedom (can be misused)

### Future Extensions (Explicitly Supported)

The chosen structure allows the following additions without data migration:

**Resources Collection:**
- Activate `resourceRef` in ResourcesBlock items
- Link to dedicated collection with images, substitutes, nutritional data
- Reusable resource definitions across instructions

**Instruction Templates:**
- Add `templateRef` to InstructionBlock
- Library of common steps (e.g., "Preheat oven", "Measure ingredients")
- Parameterized templates with variable fields

**Enhanced Metadata:**
- Duration estimates per InstructionBlock
- Difficulty indicators
- Expected outcomes
- Prerequisites

**Additional Block Types:**
- NutritionBlock (for recipes)
- WarningBlock (safety warnings)
- VideoBlock (instructional videos)
- ComparisonBlock (alternatives/substitutes)

**Interactive Features:**
- Progress tracking (checkboxes per step)
- Timer integration
- Voice control for hands-free following
- Conditional steps (advanced workflows)

## Acceptance Criteria

### Authoring (Payload CMS)
- ✅ Editors can create Instructions with title, lead, and hero image
- ✅ Editors can add ResourcesBlock with type selection (materials/tools)
- ✅ Editors can add items to ResourcesBlock (name, quantity, unit, description)
- ✅ Editors can add InstructionBlock with title, image, and content
- ✅ Editors can add InstructionSection with nested blocks
- ✅ ResourcesBlock can be added inside InstructionSection
- ✅ InstructionBlock can be added inside InstructionSection
- ✅ All blocks can be reordered via drag-and-drop
- ✅ Content block can be mixed with instruction blocks

### Frontend Rendering
- ✅ Frontend can render complete instruction deterministically
- ✅ RenderBlocks handles all instruction block types
- ✅ ResourcesBlock renders materials and tools appropriately
- ✅ InstructionBlock renders with title, image, and formatted content
- ✅ InstructionSection renders nested content recursively
- ✅ Shopping list can be aggregated from all ResourcesBlocks
- ✅ Section-specific resources can be queried and displayed

### Data Integrity
- ✅ Required fields validated (title, resource name, instruction title)
- ✅ Optional fields remain optional (quantities, descriptions, images)
- ✅ Type field enforces materials/tools selection
- ✅ Nested blocks (InstructionSection) maintain integrity
- ✅ Data model remains stable as features are added incrementally
- ✅ No breaking changes when adding templates or resource relationships

## References

- **storyField pattern**: [apps/historia/src/fields/story.ts](../../src/fields/story.ts)
- **Content block**: [apps/historia/src/blocks/Content/config.ts](../../src/blocks/Content/config.ts)
- **RenderBlocks component**: [apps/historia/src/blocks/RenderBlocks.tsx](../../src/blocks/RenderBlocks.tsx)
- **Image field pattern**: [apps/historia/src/fields/image.ts](../../src/fields/image.ts)
- **RichText usage**: [apps/historia/src/fields/richText.ts](../../src/fields/richText.ts)

## Implementation Notes

### Collection Setup
- Collection slug: `instructions`
- Admin useAsTitle: `title`
- Access control: Same pattern as other Historia collections (admins + site editors)
- Localization: title, resource names, instruction titles, richText content

### Block Definitions
- ResourcesBlock slug: `resourcesBlock`
- InstructionBlock slug: `instructionBlock`
- InstructionSection slug: `instructionSection`
- All blocks use clear interfaceName for type generation

### Field Reuse
- Leverage existing fields: `title`, `lead`, `image`, `storyField`
- Use `richText()` factory for content fields
- Follow established field patterns for consistency

### Block Structure Files
```
/apps/historia/src/blocks/
├── ResourcesBlock/
│   ├── config.ts         # Block definition
│   ├── Component.tsx     # React component
│   └── index.ts         # Barrel export
├── InstructionBlock/
│   ├── config.ts
│   ├── Component.tsx
│   └── index.ts
└── InstructionSection/
    ├── config.ts
    ├── Component.tsx
    └── index.ts
```

---

**Date**: 2026-01-25
**Author**: Project Architect (revised from original)
**Related ADRs**: None
**Changelog**:
- 2026-01-25: Revised to use story-based approach instead of separate fields
- 2026-01-24: Initial proposal with separate materials/tools/sections fields
