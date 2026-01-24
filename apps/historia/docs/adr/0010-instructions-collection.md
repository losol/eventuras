# ADR 0010 — Instructions Collection for Procedural Content

## Status
Proposed

## Context

Historia needs a domain-agnostic way to model instructional and procedural content across multiple use cases:
- Cooking and baking recipes
- Assembly and building instructions
- IT test plans and operational procedures
- How-to guides and tutorials

The MVP focus is to establish:
- A stable and explicit content structure
- A good authoring experience in Payload CMS
- Clear separation between materials/tools (what you need) and steps (what you do)
- Minimal abstraction, with a clear path for future extensions

### Inspiration from Happenings

The existing `happenings` collection provides a proven pattern:
- **Program field** (blocks) contains structured event content
- **Session blocks** represent logical sections with metadata
- **Schedule arrays** within sessions contain ordered segments
- Clear hierarchy: Happening → Sessions (blocks) → Schedule items (arrays)

This pattern balances:
- Editorial flexibility (blocks for major sections)
- Authoring simplicity (arrays for numerous similar items)
- Semantic clarity (explicit structure, not free-form)

### Key Design Question

How to structure procedural content in Payload CMS without:
- Reverting to free-form story blocks for procedural logic
- Creating excessive block nesting (poor UX with many steps)
- Losing the ability to query and validate structure

## Decision

Create an **Instructions collection** (slug: `instructions`) following the happenings/program pattern:
- **Sections as Payload blocks** (visual units in admin UI)
- **Steps as ordered arrays** inside each section (lightweight, numerous items)
- **Materials and tools at instruction level** (overview before you start)

### Content Model

```
Instructions
├── title (text)
├── lead (richText, localized)
├── image (group: media + caption)
├── materials (array of MaterialGroup)
│   └── MaterialGroup
│       ├── title (text, e.g., "For dough", "For filling")
│       └── items (array)
│           ├── name (text, required)
│           ├── quantity (text, optional)
│           └── unit (text, optional)
├── tools (array)
│   └── Tool
│       ├── name (text, for MVP)
│       └── toolRef (relationship to 'tools' collection, future)
└── sections (blocks)
    └── Section block
        ├── title (text)
        ├── description (richText, localized, optional intro)
        └── steps (array)
            ├── title (text, required)
            ├── image (group: media + caption)
            └── content (richText, localized, optional detail)
```

### Authoring Experience

**Materials & Tools (Top Level):**
- Editors define grouped material lists (e.g., "For crust", "For filling")
- Tools listed separately (reusable items like "mixer", "hammer")
- Clear overview before diving into procedural steps

**Sections (Blocks):**
- Each section is a visual unit in Payload admin
- Maps to real-world concepts (e.g., "Preparation", "Assembly", "Testing")
- Can be reordered, added, or removed easily
- Allows future extension (section templates) without schema changes

**Steps (Arrays):**
- Lightweight items within sections
- Simple to add, edit, and reorder
- Each step can have a main image with caption
- RichText content allows embedded images, formatting, lists
- Avoids block nesting complexity

### Frontend Flexibility

Although materials are defined at instruction level in CMS, frontend can present them multiple ways:
- **Complete shopping list** (aggregate all materials)
- **Grouped by material group** (as authored)
- **Just-in-time** (show relevant materials per section/step)
- **Interactive checklist** (future feature)

This separation of authoring structure (admin UX) from presentation (frontend UX) is intentional.

## Rationale

### Why Sections as Blocks

- ✅ Blocks give editors a clear, visual unit in the admin UI
- ✅ Sections map naturally to real-world procedural phases
- ✅ Blocks allow future extension (templates, metadata) without data migration
- ✅ Editors can reorganize entire sections with drag-and-drop
- ✅ Proven pattern from happenings/program

### Why Steps as Arrays (Not Blocks)

- ✅ Steps are numerous and lightweight (recipes can have 15+ steps)
- ✅ Arrays are simpler to edit than nested blocks
- ✅ Reduces authoring friction in MVP
- ✅ Avoids block sprawl in admin UI
- ✅ Clear ordering and validation
- ✅ Each step can still have rich content (image + richText)

### Why Materials/Tools at Instruction Level

- ✅ Matches real-world pattern (recipe lists all ingredients first)
- ✅ Editors provide complete overview
- ✅ Frontend can aggregate and present flexibly
- ✅ Grouped materials (MaterialGroup) organize related items
- ✅ Tools as separate concept (reusable vs consumable)

### Why Not Story Blocks for Procedural Flow

- ❌ Procedural steps have strict order and semantics
- ❌ Story blocks optimized for narrative content, not execution logic
- ❌ Using story blocks would obscure ordering guarantees
- ❌ Complicates future features (templates, interactivity, progress tracking)
- ❌ Creates competing representations of "how-to" content

**Note:** Story blocks remain suitable for:
- Introductory context and background
- Tips, variations, and explanations
- Narrative content surrounding instructions

## Consequences

### Positive

- ✅ Clear separation between overview (materials/tools) and procedure (sections/steps)
- ✅ Strong editor experience without sacrificing semantic clarity
- ✅ Follows proven happenings/program pattern
- ✅ Minimal MVP complexity
- ✅ Stable foundation for future extensions
- ✅ No migration required to add templates later
- ✅ Frontend presentation flexibility
- ✅ Works across cooking, building, IT procedures, and more

### Trade-offs

- ⚠️ Materials defined at top level (not per step) requires frontend aggregation for granular UX
- ⚠️ Less flexibility inside individual steps compared to full block-based content
- ⚠️ Rich formatting inside steps intentionally limited to richText capabilities
- ⚠️ Step reuse is manual (copy/paste) until templates are introduced
- ⚠️ Tools field is simple text for MVP (relationship to tools collection deferred)

### Future Extensions (Explicitly Supported)

The chosen structure allows the following additions without data migration:

**Step Templates:**
- Add `stepTemplateRef` (relationship field)
- Add `templateParams` (config object)
- Editors can select from library of common steps

**Section Templates:**
- Add `sectionTemplateRef` to Section block
- Pre-built sections for common workflows

**Tool Relationships:**
- Activate `toolRef` in tools array
- Link to dedicated `tools` collection
- Reusable tool definitions with images, links, specs

**Step-Level Metadata:**
- Duration estimates
- Expected outcomes
- Difficulty indicators
- Required tools per step

**Interactive Features:**
- Progress tracking
- Checklists
- Timer integration
- Conditional steps (advanced)

**Enhanced Materials:**
- Images per material item
- Substitution suggestions
- Nutritional data (recipes)
- Material relationships to products collection

## Acceptance Criteria

### Authoring (Payload CMS)
- ✅ Editors can create Instructions with title, lead, and hero image
- ✅ Editors can define grouped materials (MaterialGroups with items)
- ✅ Editors can list required tools
- ✅ Editors can create multiple Sections (as blocks)
- ✅ Editors can add ordered Steps within each Section
- ✅ Each Step can have title, image, and richText content
- ✅ Sections can be reordered via drag-and-drop
- ✅ Steps can be reordered within sections

### Frontend Rendering
- ✅ Frontend can render complete instruction deterministically
- ✅ Materials and tools displayed before procedural content
- ✅ Sections rendered in authored order
- ✅ Steps rendered in authored order
- ✅ Images and captions displayed correctly
- ✅ RichText content rendered with proper formatting

### Data Integrity
- ✅ Required fields validated (title, step title)
- ✅ Optional fields remain optional (quantities, descriptions)
- ✅ Data model remains stable as features are added incrementally
- ✅ No breaking changes when adding template support later

## References

- **Happenings collection pattern**: [apps/historia/src/collections/happenings.ts](../../src/collections/happenings.ts)
- **Session block example**: [apps/historia/src/blocks/session.ts](../../src/blocks/session.ts)
- **Image field pattern**: [apps/historia/src/fields/image.ts](../../src/fields/image.ts)
- **RichText usage**: [apps/historia/src/fields/description.ts](../../src/fields/description.ts)

## Implementation Notes

### Collection Setup
- Collection slug: `instructions`
- Admin useAsTitle: `title`
- Access control: Same pattern as other Historia collections (admins + site editors)
- Localization: title, lead, step content, descriptions

### Block Definition
- Section block slug: `section`
- Block interface name: `SectionBlock`
- Reusable across other collections if needed

### Field Reuse
- Leverage existing fields: `title`, `lead`, `image`
- Create new fields: `materials`, `tools`, `sections`
- Follow established field patterns for consistency

---

**Date**: 2026-01-24
**Author**: Project Architect
**Related ADRs**: None
