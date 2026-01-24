# ADR 0007 — Terms/Glossary Collection

## Status
Draft

## Context

A knowledge management CMS needs a structured way to define and manage terminology. Users need to:

- Define technical terms and concepts with authoritative definitions
- Support multiple definitions for the same term (different contexts, periods, disciplines)
- Provide tooltips and inline explanations in content
- Link definitions to authoritative sources
- Enable semantic search and cross-referencing
- Support localization of definitions
- Generate SEO-friendly term pages with schema.org markup

### Current Limitations

Without a dedicated Terms collection:

- ❌ No structured terminology management
- ❌ Definitions scattered across articles (hard to maintain)
- ❌ No reusable tooltips for technical terms
- ❌ Missing semantic relationships between concepts
- ❌ No source attribution for definitions
- ❌ Difficult to maintain consistency across content

### Requirements

**Content Management:**
- Define terms with rich text definitions
- Support multiple definitions per term (different contexts/meanings)
- Short definitions for tooltips and previews
- Synonyms and alternative spellings
- Related terms (semantic network)

**Attribution:**
- Link definitions to authoritative sources
- Track which sources define each meaning
- Support both cited and original definitions

**Flexibility:**
- Simple terms with one definition (e.g., "Database")
- Complex terms with multiple meanings (e.g., "Kildekritikk" in history vs media studies)
- Context-specific variations (historical periods, disciplines, regions)

**Discoverability:**
- Categorization by topic/discipline
- Search and filtering
- Public pages with SEO optimization
- Schema.org DefinedTerm support

## Decision

Implement a **Terms collection** with a hybrid structure that supports both:

1. **Nested definitions** (multiple definitions within one entry)
2. **Flat entries** (separate entries per context with one definition each)

This flexibility allows editors to choose the most appropriate structure based on the relationship between definitions.

### Versioning Strategy

**Draft/publish workflow enabled:**
- **Rationale:** Editors need to review and refine definitions before publication
- **No full history:** Definitions are updated in place, not preserved as versions
- **Configuration:**
  ```typescript
  versions: {
    drafts: {
      autosave: true,
    },
  }
  ```

### Multi-Tenancy Strategy

**Organization-scoped:** Terms and definitions are isolated per organization.

- **Rationale:** Organizations have their own terminology, internal jargon, and context-specific definitions
- **No cross-tenant sharing:** Each organization maintains their own glossary
- **Use case:** Corporate terminology, discipline-specific definitions, localized vocabulary
- **Implementation:** Handled by multiTenantPlugin - adds tenant field and filters queries automatically
- **Access control:** Collection uses standard access patterns; plugin enforces tenant isolation at query level

### Collection Structure

```typescript
export const Terms: CollectionConfig = {
  slug: 'terms',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'updatedAt'],
  },
  versions: {
    drafts: {
      autosave: true,
    },
  },
  fields: [
    // Core term identification
    {
      name: 'term',
      type: 'text',
      required: true,
      label: 'Term',
      admin: {
        description: 'The term being defined (e.g., "Kildekritikk", "Database")',
      },
    },
    {
      name: 'context',
      type: 'text',
      required: false,
      label: 'Context',
      admin: {
        description: 'Optional context/specialization (e.g., "historical method", "media studies"). Leave empty for general terms.',
      },
    },
    {
      name: 'title',
      type: 'text',
      required: false,
      admin: {
        hidden: true,
        readOnly: true,
      },
      // Auto-generated: "Kildekritikk" or "Kildekritikk (historical method)"
    },

    // Definitions array (supports multiple meanings)
    {
      name: 'definitions',
      type: 'array',
      required: true,
      minRows: 1,
      label: 'Definitions',
      admin: {
        description: 'Add multiple definitions if the term has different meanings within the same context.',
      },
      fields: [
        {
          name: 'definition',
          type: 'richText',
          required: true,
          localized: true,
          label: 'Definition',
          admin: {
            description: 'Full definition with examples and context',
          },
        },
        {
          name: 'shortDefinition',
          type: 'text',
          maxLength: 200,
          required: true,
          localized: true,
          label: 'Short Definition',
          admin: {
            description: 'Concise definition for tooltips and previews (max 200 characters)',
          },
        },
        {
          name: 'variant',
          type: 'text',
          label: 'Variant',
          admin: {
            description: 'Optional sub-context or variant (e.g., "early period", "modern usage", "legal")',
          },
        },
        {
          name: 'isPrimary',
          type: 'checkbox',
          defaultValue: false,
          label: 'Primary Definition',
          admin: {
            description: 'Show this definition by default in tooltips and previews',
          },
        },
        {
          name: 'sources',
          type: 'relationship',
          relationTo: 'sources',
          hasMany: true,
          label: 'Sources',
          admin: {
            description: 'Authoritative sources for this definition',
          },
        },
      ],
    },

    // Synonyms and alternatives
    {
      name: 'synonyms',
      type: 'array',
      label: 'Synonyms',
      admin: {
        description: 'Alternative terms, translations, or common misspellings',
      },
      fields: [{
        name: 'synonym',
        type: 'text',
        required: true,
      }],
    },

    // Semantic relationships
    {
      name: 'relatedTerms',
      type: 'relationship',
      relationTo: 'terms',
      hasMany: true,
      label: 'Related Terms',
      admin: {
        description: 'Semantically related concepts (broader, narrower, or related terms)',
      },
    },

    // Categorization
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'topics',
      label: 'Category',
      admin: {
        description: 'Primary topic/discipline for this term',
      },
    },

    // SEO
    seoTab,
    resourceId,
  ],
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (!data) return data;

        // Auto-generate title from term + context
        if (data.term) {
          data.title = data.context
            ? `${data.term} (${data.context})`
            : data.term;
        }

        return data;
      },
    ],
  },
}
```

### Key Design Decisions

#### 1. Hybrid Structure (Nested + Flat)

**Rationale:**
- Editors choose the most appropriate structure based on semantic relationships
- Nested definitions: Closely related meanings (nuances, historical evolution)
- Flat entries: Distinct meanings requiring separate URLs and SEO

**Examples:**

**Nested approach** (closely related meanings):
```
Entry: "Democracy"
- context: (empty)
- definitions:
  1. variant: "political system", definition: "...", isPrimary: true
  2. variant: "social practice", definition: "..."
  3. variant: "philosophical concept", definition: "..."
```

**Flat approach** (distinct contexts):
```
Entry 1: "Kildekritikk (historical method)"
- context: "historical method"
- definitions: [one definition, isPrimary: true]

Entry 2: "Kildekritikk (media studies)"
- context: "media studies"
- definitions: [one definition, isPrimary: true]
```

**Alternatives Considered:**
- Only nested → Loses URL/SEO optimization for distinct meanings
- Only flat → Verbose for terms with subtle variations
- Separate collections → Unnecessarily complex

#### 2. Definitions Array with Primary Flag

```typescript
{
  name: 'isPrimary',
  type: 'checkbox',
  defaultValue: false,
}
```

**Rationale:**
- Multiple definitions per entry require a default for tooltips
- Editor explicitly marks the most common/standard definition
- Fallback: First definition if none marked as primary

**Use Cases:**
- Tooltips show primary definition
- Search results display primary definition
- Article inline glossary uses primary definition
- Full term page shows all definitions

**Alternatives Considered:**
- Order-based (first = primary) → Less explicit, easy to mess up by reordering
- Separate primary definition field → Duplication, harder to maintain

#### 3. Optional Context Field

```typescript
{
  name: 'context',
  type: 'text',
  required: false,
}
```

**Rationale:**
- General terms don't need context ("Database", "Server")
- Specialized terms benefit from explicit context ("Kildekritikk (historical method)")
- Context becomes part of title and slug for SEO

**Auto-Generated Title Pattern:**
- No context: `"Democracy"` → slug: `democracy`
- With context: `"Democracy (ancient Athens)"` → slug: `democracy-ancient-athens`

**Alternatives Considered:**
- Always require context → Verbose for simple terms
- Context as enum → Too restrictive, disciplines vary widely
- Context as relationship to Topics → Over-engineered, text is sufficient

#### 4. Short Definition Requirement

```typescript
{
  name: 'shortDefinition',
  type: 'text',
  maxLength: 200,
  required: true,
}
```

**Rationale:**
- Tooltips need concise text (rich text too complex)
- Search results and previews need short summaries
- Forces clarity (good definitions are concise)
- 200 characters = ~30-40 words (sufficient for clarity)

**Alternatives Considered:**
- Auto-extract from rich text → Lexical extraction unreliable, may cut mid-sentence
- Optional short definition → Tooltips would fail, editors might skip it
- Longer limit → Defeats purpose of "short" definition

#### 5. Variant Field (Sub-Context)

```typescript
{
  name: 'variant',
  type: 'text',
  label: 'Variant',
}
```

**Rationale:**
- Enables fine-grained distinction within same context
- Example: "Democracy (ancient Athens)" with variants: "direct democracy", "restricted suffrage"
- Keeps related definitions grouped while maintaining distinctions
- Optional (only needed for complex terms)

**Alternatives Considered:**
- Nested contexts → Too complex, harder to query
- More specific field names → "period", "discipline" too restrictive
- Free-form text → Maximum flexibility

#### 6. Sources Per Definition

**Rationale:**
- Each definition may have different authoritative sources
- Academic rigor requires precise attribution
- Enables citation generation for definitions

**Example:**
```
Term: "Kildekritikk"
Definition 1 (historical method):
  - sources: [Fink, "Kildekritikk" (1928)]
Definition 2 (media studies):
  - sources: [Schwebs & Østbye (2001)]
```

#### 7. Related Terms (Semantic Network)

```typescript
{
  name: 'relatedTerms',
  type: 'relationship',
  relationTo: 'terms',
  hasMany: true,
}
```

**Rationale:**
- Builds semantic web of concepts
- "See also" navigation on term pages
- Enables discovery of related concepts
- Future: Visualize concept maps

**Relationship Types (Future Enhancement):**
- Broader term (BT)
- Narrower term (NT)
- Related term (RT)
- Use for (UF) - synonyms that redirect

**Alternatives Considered:**
- Typed relationships → More complex, defer to future
- Topics only → Too coarse-grained
- Bidirectional relationship enforced → Too restrictive

### Schema.org Mapping

Terms map to [`schema.org/DefinedTerm`](https://schema.org/DefinedTerm):

```json
{
  "@context": "https://schema.org",
  "@type": "DefinedTerm",
  "name": "Kildekritikk",
  "description": "Metode for systematisk vurdering av kilders troverdighet...",
  "inDefinedTermSet": {
    "@type": "DefinedTermSet",
    "name": "Historia Glossary"
  }
}
```

**For multiple definitions:**
- Emit primary definition in JSON-LD
- Or emit as `DefinedTermSet` with multiple `DefinedTerm` entries

## Consequences

### Positive

✅ **Flexible structure** — Supports both simple and complex terminology

✅ **Reusable definitions** — Tooltips, inline explanations, glossary pages

✅ **Source attribution** — Academic rigor with precise citations

✅ **Semantic network** — Related terms enable knowledge discovery

✅ **SEO optimization** — Dedicated term pages with schema.org markup

✅ **Localized content** — Definitions translated to multiple languages

✅ **Editor choice** — Nested vs flat based on semantic relationships

### Negative

⚠️ **Complexity** — Hybrid structure has learning curve for editors

⚠️ **Duplication risk** — Flat entries may duplicate effort

⚠️ **Maintenance** — Multiple definitions require ongoing curation

⚠️ **Primary selection** — Editors must consciously choose primary definition

### Mitigations

- **Documentation** — Clear editor guidelines on nested vs flat
- **Admin UI** — Helper text explaining when to use each approach
- **Validation** — At least one primary definition per entry
- **Search** — Fuzzy search finds terms regardless of context

## Future Enhancements (Out of Scope)

**Typed Relationships:**
- Broader/narrower term hierarchies
- Synonym redirects (UF/USE)
- Part-of relationships

**Rich Features:**
- Etymology and word origin
- Historical usage examples
- Pronunciation guides
- Visual diagrams/illustrations

**Integration:**
- Inline glossary tooltips in richText
- Auto-linking terms in articles
- Glossary widget/sidebar
- Export to SKOS/RDF

**Visualization:**
- Concept maps
- Ontology browser
- Term hierarchy trees

## Alternatives Considered

### Alternative 1: Wikipedia-Style (Single Entry per Term)

Single entry with sections for different meanings.

**Pros:**
- Simpler structure
- All meanings in one place

**Cons:**
- Poor SEO (one URL for multiple concepts)
- Complex frontend rendering
- Harder to attribute sources per meaning

**Why Rejected:** Lacks flexibility for distinct contexts

### Alternative 2: Strict Flat Structure Only

Always create separate entries for different contexts.

**Pros:**
- Consistent structure
- Easy to implement
- Clear SEO optimization

**Cons:**
- Verbose for subtle variations
- Hard to group related meanings
- Duplication of metadata (synonyms, related terms)

**Why Rejected:** Too rigid, doesn't match mental model

### Alternative 3: Typed Definition Relationships

Explicit relationship types (broader/narrower/related) between definitions.

**Pros:**
- Formal ontology
- Structured semantic network
- SKOS compatibility

**Cons:**
- Complex for editors
- Overhead for simple terms
- May not match real-world usage

**Why Rejected:** Over-engineered for MVP, defer to future

## Implementation Checklist

- [ ] Create `apps/historia/src/collections/Terms.ts`
- [ ] Register collection in `payload.config.ts`
- [ ] Implement auto-title hook (term + context)
- [ ] Implement primary definition validation (at least one)
- [ ] Add to localized collection name mapping
- [ ] Create frontend route: `/[locale]/c/term/[slug]` or `/[locale]/c/begrep/[slug]`
- [ ] Implement schema.org DefinedTerm JSON-LD
- [ ] Create term page component with all definitions
- [ ] Implement tooltip component for inline use
- [ ] Add SEO metadata generation
- [ ] Test nested definitions display
- [ ] Test flat entries with context
- [ ] Generate TypeScript types
- [ ] Run database migrations
- [ ] Update documentation

## References

- [schema.org/DefinedTerm](https://schema.org/DefinedTerm)
- [schema.org/DefinedTermSet](https://schema.org/DefinedTermSet)
- [ISO 25964 - Thesauri](https://www.iso.org/standard/53657.html)
- [SKOS Simple Knowledge Organization System](https://www.w3.org/2004/02/skos/)
- ADR 0006 - Quotes and Sources Collections (pattern reference)
