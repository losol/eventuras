# ADR 0006 — Quotes and Sources Collections

## Status
Accepted (Implemented with MVP simplifications)

## Context

Historia needs a system for managing quotations with proper attribution and source tracking. This is useful for:

- **Knowledge management** — Collecting insights and wisdom from various sources
- **Content creation** — Embedding authoritative quotes in articles and pages
- **Academic work** — Maintaining proper citations and references
- **Personal knowledge bases** — Organizing quotes by author, topic, and source

**Current Limitations:**

1. **No dedicated quote storage** — Users must manually add quotes in rich text fields
2. **No structured attribution** — Attribution is inconsistent and hard to query
3. **No source tracking** — Can't link quotes to their original sources
4. **No reusability** — Same quote must be re-entered in multiple places
5. **No uncertain attribution** — Can't distinguish between confirmed and attributed quotes

**Use Cases:**

- Author wants to maintain a collection of favorite quotes from various books
- Researcher needs to track quotes from interviews with proper timestamps
- Organization wants to collect policy statements from different entities
- User wants to embed quotes in articles with proper attribution
- Academic needs to distinguish between confirmed and misattributed quotes

**Requirements:**

- Store quotes with rich text formatting (for emphasis, etc.)
- Support multiple authors (persons or organizations)
- Handle uncertain attribution ("often attributed to...", "anonymous")
- Link to source materials (books, articles, speeches)
- Precise location references (page numbers, timestamps)
- Multilingual quotes
- Public-facing quote pages (resourceId-based URLs)
- Reusable across articles and pages (future)

## Decision

### Architecture Overview

Implement two new Payload collections with a clear separation of concerns:

```
┌──────────────────┐         ┌──────────────────┐
│    Persons       │         │  Organizations   │
│   (existing)     │         │    (existing)    │
└────────┬─────────┘         └────────┬─────────┘
         │                            │
         │         authors            │
         └──────────┬─────────────────┘
                    │ (polymorphic)
                    ▼
         ┌──────────────────┐
         │     Quotes       │ ◄──────┐
         │  (quote + meta)  │        │ references
         └──────────┬───────┘        │
                    │                │
                    │ source         │
                    ▼                │
         ┌──────────────────┐        │
         │     Sources      │────────┘
         │ (books, articles)│
         └──────────────────┘
```

### 1. Quotes Collection

**Purpose:** Store individual quotations with attribution and context.

**Key Design Decisions:**

**1.1 Author Field (MVP Simplification)**

```typescript
{
  name: 'author',
  type: 'relationship',
  relationTo: 'persons',
}
```

**MVP Decision:**
- **Single author** (not array) - For simple quotes with one person
- **Persons only** (not organizations) - Organizations use `attributionText` instead
- **For complex sources** - Users should create a Source entry with contributors array

**Rationale:**
- Covers 95% of use cases (single person quotes)
- Reduces UI complexity for MVP
- Sources collection handles multi-author and organizational works properly
- Can expand to polymorphic array later if needed

**Alternatives Considered:**
- ~~Polymorphic persons/organizations~~ → Deferred to Sources collection
- ~~Multiple authors (array)~~ → Deferred; use Sources for complex cases

**1.2 Attribution System (MVP Simplification)**

```typescript
{
  name: 'attributionText',
  type: 'text',
  admin: {
    condition: (data) => !data.author,
  }
}
```

**MVP Decision:**
- **Single text field** - For organizations, uncertain attribution, or unknown authors
- **Conditional display** - Only shown when `author` is not selected
- **Removed `attributionType`** - Deferred to future enhancement

**Rationale:**
- Simpler UX for MVP - either pick a person or type attribution text
- Free-form text handles all edge cases ("WHO", "Anonymous", "Attributed to Mark Twain")
- Can add structured type field later if filtering becomes important

**Alternatives Considered:**
- ~~attributionType + attributionText~~ → Over-engineered for MVP
- Separate authorText field → Merged into attributionText for simplicity

**1.3 Auto-Generated Titles**

```typescript
hooks: {
  beforeValidate: [
    async ({ data, req }) => {
      // Lookup author.name if relationship exists
      // Else use attributionText
      // Append resourceId
      // Generate: "Einstein - #QUOT-123"
      // Or: "Anonymous - #QUOT-124"
    }
  ]
}
```

**Rationale:**
- Quote text is rich text and localized → Can't use directly as title
- Author name + resourceId creates scannable admin list
- Auto-generation ensures consistency
- Falls back gracefully (attributionText → "Quote")

**Alternatives Considered:**
- Manual title field → Inconsistent, extra work for users
- First N chars of quote → Unreliable with rich text, loses context
- Only resourceId → Less human-readable in admin

**1.4 Rich Text Quote Field**

```typescript
richText({
  name: 'quote',
  localized: true,
  required: true,
})
```

**Rationale:**
- Quotes may need emphasis, italics, or line breaks
- Multilingual sites need translated quotes
- Consistency with other content types (Notes, Articles)

**Alternatives Considered:**
- Plain textarea → Loses formatting (some quotes need emphasis)
- Non-localized → Forces single language per quote

**1.5 Source + Locator Pattern**

```typescript
{
  name: 'source',
  type: 'relationship',
  relationTo: 'sources',
}
{
  name: 'locator',
  type: 'text',
  // e.g., "p. 42", "ch. 3", "01:23:45"
}
```

**Rationale:**
- Source is the work (book, speech, article)
- Locator is the precise location within that source
- Free-text locator handles various formats (pages, timestamps, chapters)
- Simple and flexible

**Alternatives Considered:**
- Structured locator (type + value) → Over-engineered for MVP
- Combined source+locator field → Harder to query by source
- No locator → Loses precision of citation

### 2. Sources Collection

**Purpose:** Manage source materials that quotes reference.

**Key Design Decisions:**

**2.1 Source Types**

```typescript
{
  name: 'sourceType',
  type: 'select',
  required: true,
  defaultValue: 'default',
  options: [
    'default',
    'article-journal', 'book', 'chapter', 'report', 'thesis', 'paper-conference',
    'webpage', 'article-newspaper',
    'legislation'
  ]
}
```

**Rationale:**
- CSL JSON citation style types for compatibility with Zotero, Mendeley, etc.
- Different source types trigger conditional fields (accessedDate, publicationPlace, edition)
- Required field with default ensures consistency

**2.2 File Upload Support (Multiple Files)**

```typescript
{
  name: 'files',
  type: 'upload',
  relationTo: 'media',
  hasMany: true,
}
```

**Rationale:**
- Sources may have multiple files (different editions, supplements, appendices)
- `hasMany: true` enables uploading multiple PDFs per source
- Users may have PDFs of articles, speeches, etc.
- Enables self-contained knowledge base
- Optional (not all sources are downloadable)

**2.3 Contributors Array (with Roles)**

```typescript
{
  name: 'contributors',
  type: 'array',
  fields: [
    {
      name: 'entity',
      type: 'relationship',
      relationTo: ['persons', 'organizations'],
      required: true,
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      options: [
        'author', 'editor', 'translator', 'interviewer',
        'interviewee', 'producer', 'contributor'
      ],
    },
  ],
}
```

**Rationale:**
- Sources often have multiple contributors with different roles
- Polymorphic entity relationship handles both persons and organizations
- Role field enables proper attribution ("Edited by X", "Translated by Y")
- Order matters - Payload preserves array order automatically
- Maps to schema.org `author`, `editor`, `translator`, etc.

**2.4 Publisher Field (MVP Simplification)**

```typescript
{
  name: 'publisher',
  type: 'text',
}
```

**MVP Decision:**
- **Text field** instead of organization relationship
- Reduces friction - no need to create Organization for every publisher
- Can migrate to relationship later if needed

**Rationale:**
- Most publishers are one-time mentions ("Oxford University Press", "Random House")
- Creating Organization entries for all publishers is overhead
- Text field sufficient for citation generation
- Can upgrade to relationship when publisher pages become valuable

**2.5 ~~Hierarchical Sources (isPartOf)~~ — Deferred**

**MVP Decision:** Removed self-referencing `isPartOf` field.

**Rationale:**
- Adds complexity for uncertain value in MVP
- Can be modeled via `publicationContext.containerTitle` for most cases
- Can add later if hierarchical source management becomes important

**Alternative:** Use `publicationContext.containerTitle` for journal/book names

**2.6 Publication Context**

```typescript
{
  name: 'publicationContext',
  type: 'group',
  fields: [
    {
      name: 'containerTitle',
      type: 'text',
      label: 'Journal/Book Title',
    },
    {
      name: 'volume',
      type: 'text',
    },
    {
      name: 'issue',
      type: 'text',
    },
    {
      name: 'page',
      type: 'text',
      label: 'Pages',
      admin: {
        description: 'e.g. "123-145", "S12-S15", "xii-xv"',
      },
    },
  ]
}
```

**MVP Changes:**
- **No condition** - Always visible (user decides when to fill it)
- **Single `page` field** - Handles ranges and roman numerals as free text ("123-145", "xii-xv")
- Removed `pageStart`/`pageEnd` - Free text is more flexible

**Rationale:**
- Essential metadata for scholarly articles
- Enables generation of proper citations (APA, MLA, Chicago)
- Free-text pages handle edge cases (roman numerals, supplement pages)
- Always showing the group is simpler than conditional logic

**2.7 ~~Public Pages with SEO~~ — Simplified to ResourceId URLs**

**MVP Decision:**
- **No slug field** - Use resourceId instead (`/i/source/SRC-abc123`)
- **No seoTab** - Deferred SEO optimization

**Rationale:**
- Slug generation is complex for bibliographic sources (long titles, special characters)
- ResourceId-based URLs are consistent and collision-free
- Can add slug later if SEO becomes important
- `/i/source/SRC-123` pattern clearly indicates "item by ID" URLs

**URL Pattern:**
- Quotes: `/locale/i/quote/QUOT-abc123`
- Sources: `/locale/i/source/SRC-def456`
- `/i/` = "item" (ID-based reference page)

**Alternatives Considered:**
- Auto-generate slugs from title → Too complex, many edge cases
- Manual slugs → Extra overhead, not worth it for reference pages

### 3. Separation of Quotes and Sources

**Rationale for Two Collections:**

1. **Reusability** — Multiple quotes can reference the same source
2. **Source-focused pages** — Can show all quotes from a book
3. **Independent management** — Add sources before quotes
4. **Clearer domain model** — Quote ≠ Source
5. **Different lifecycles** — Sources rarely change, quotes added frequently

**Alternatives Considered:**

**Single "Quotations" collection with embedded source:**
```typescript
{
  quote: "...",
  source: {
    title: "Book Title",
    author: "...",
    // ... all source metadata embedded
  }
}
```
❌ Problems:
- Source duplication (same book referenced 10 times = 10 copies)
- No source-focused pages
- Harder to update source metadata
- Can't list "all sources" independently

**Quotes only, no Sources:**
```typescript
{
  quote: "...",
  sourceTitle: "Book Title",
  sourceAuthor: "...",
  // ... flat fields
}
```
❌ Problems:
- Even worse duplication
- No structured source data
- Can't link to source material
- No source pages

### 4. Additional Bibliographic Fields

**4.1 Conditional Fields Based on Source Type**

```typescript
// For webpages
{
  name: 'accessedDate',
  type: 'date',
  admin: {
    condition: (data) => data?.sourceType === 'webpage',
  },
}

// For books, chapters, theses
{
  name: 'publicationPlace',
  type: 'text',
  admin: {
    condition: (data) => ['book', 'chapter', 'thesis'].includes(data?.sourceType),
  },
}

// For books
{
  name: 'edition',
  type: 'text',
  admin: {
    condition: (data) => data?.sourceType === 'book',
  },
}
```

**Rationale:**
- **accessedDate** - Required for web citations (content changes over time)
- **publicationPlace** - Standard in book citations ("Oslo: Universitetsforlaget")
- **edition** - Critical for books (1st vs 2nd edition can have major differences)
- Conditional display reduces clutter for irrelevant fields

### 5. Identifiers Array

```typescript
{
  name: 'identifiers',
  type: 'array',
  fields: [
    {
      name: 'type',
      type: 'select',
      options: ['isbn', 'doi', 'pmid', 'arxiv', 'issn', 'other'],
    },
    {
      name: 'value',
      type: 'text',
    },
  ],
}
```

**Rationale:**
- Academic sources often have multiple identifiers (ISBN + DOI)
- Type + value pattern enables proper citation formatting
- Extensible with "other" option for edge cases

## Consequences

### Positive

✅ **Clear domain model** — Quotes and sources are distinct, well-defined entities

✅ **Flexible attribution** — Handles confirmed, attributed, and unknown quotes

✅ **Polymorphic relationships** — Supports persons and organizations as authors

✅ **Precise citations** — Source + locator pattern enables accurate references

✅ **Reusability** — Sources can be referenced by multiple quotes

✅ **SEO-friendly** — Both quotes and sources get public pages

✅ **Multilingual** — Quotes and source notes support localization

✅ **File storage** — Sources can include PDFs and documents

✅ **Extensible** — Easy to add future features (topics, embedding, etc.)

### Negative

⚠️ **More complex queries** — Fetching quote with author + source = 3 collections

⚠️ **Additional admin overhead** — Users must create sources separately

⚠️ **No SEO optimization** — ResourceId URLs are functional but not SEO-friendly

⚠️ **Auto-title hook** — Requires async database calls in beforeValidate hook

⚠️ **Limited Quotes flexibility** — Single author, persons-only (complex cases use Sources)

### Mitigations

- **Query complexity** → Use Payload's populate/depth features
- **Admin overhead** → Add quick-create modals for sources (future)
- **No SEO** → Can add slug field later if needed (MVP focuses on functionality)
- **Hook performance** → Consider caching author names (if needed)
- **Limited Quotes** → Guidance text directs users to Sources for complex attribution

## Future Enhancements (Out of Scope)

- **Quote embedding** — Embed quotes in articles/pages via blocks
- **Quote archive page** — Public listing of all quotes
- **Source page quotes** — Show all quotes from a source
- **Topics/tags** — Categorize quotes by topic
- **Citation formatting** — Generate APA, MLA, Chicago citations
- **Quote of the day** — Random quote widget
- **Search integration** — Full-text search across quotes
- **Quick-create modals** — Create source directly from quote editor
- **Related content** — Link quotes to articles that discuss them

## References

- **Payload Polymorphic Relationships:** https://payloadcms.com/docs/fields/relationship#polymorphic-relationships
- **Similar pattern:** Notes collection (`apps/historia/src/collections/Notes.ts`)
- **Access control pattern:** Existing collections (admins + siteEditors)
- **Auto-title pattern:** Persons collection hook

## Examples

### Example 1: Confirmed Quote with Source

```typescript
{
  quote: "Imagination is more important than knowledge.",
  authors: [{ relationTo: 'persons', value: 'einstein-id' }],
  attributionType: 'confirmed',
  source: 'on-science-book-id',
  locator: 'p. 97',
  // Generated title: "Albert Einstein - #QUOT-001"
}
```

### Example 2: Attributed Quote

```typescript
{
  quote: "The reports of my death are greatly exaggerated.",
  authors: [{ relationTo: 'persons', value: 'twain-id' }],
  attributionType: 'attributed',
  attributionText: 'Often misattributed to Mark Twain',
  // Generated title: "Mark Twain - #QUOT-002"
}
```

### Example 3: Anonymous Quote

```typescript
{
  quote: "A journey of a thousand miles begins with a single step.",
  authors: [],
  attributionType: 'unknown',
  attributionText: 'Anonymous',
  // Generated title: "Anonymous - #QUOT-003"
}
```

### Example 4: Organizational Author

```typescript
{
  quote: "Health is a state of complete physical, mental and social well-being.",
  authors: [{ relationTo: 'organizations', value: 'who-id' }],
  attributionType: 'confirmed',
  source: 'who-constitution-id',
  locator: 'Preamble',
  // Generated title: "World Health Organization - #QUOT-004"
}
```

### Example 5: Joint Statement

```typescript
{
  quote: "We commit to reducing carbon emissions by 50% by 2030.",
  authors: [
    { relationTo: 'organizations', value: 'un-id' },
    { relationTo: 'organizations', value: 'eu-id' }
  ],
  attributionType: 'confirmed',
  source: 'climate-agreement-id',
  // Generated title: "United Nations, European Union - #QUOT-005"
}
```

## Discussion: Schema.org Compatibility

### Quotation Type

The **Quotes** collection aligns closely with [`schema.org/Quotation`](https://schema.org/Quotation):

**Current mapping:**
- `quote` → `quotation.text`
- `authors` → `quotation.creator` (Person or Organization)
- `source` → `quotation.isBasedOn` (CreativeWork)
- `context` → `quotation.about` / `description`
- `dateSpoken` (proposed) → `quotation.dateCreated`

**Language handling:**
- ❌ **Not needed**: CMS already handles localization via Payload's built-in i18n
- ✅ **Alternative**: Use Payload's locale context for schema.org `inLanguage` in frontend

### CreativeWork Type

The **Sources** collection maps to various [`schema.org/CreativeWork`](https://schema.org/CreativeWork) subtypes:

**Type mapping:**
- `book` → [`schema.org/Book`](https://schema.org/Book)
- `article` → [`schema.org/Article`](https://schema.org/Article) or [`schema.org/ScholarlyArticle`](https://schema.org/ScholarlyArticle)
- `speech` → [`schema.org/SpeechEvent`](https://schema.org/SpeechEvent)
- `interview` → [`schema.org/Interview`](https://schema.org/Interview)
- `website` → [`schema.org/WebPage`](https://schema.org/WebPage)

**Current mapping:**
- `title` → `name`
- `authors` → `author` / `creator`
- `publishedDate` → `datePublished`
- `url` → `url`
- `identifier` → `identifier` (ISBN, DOI)
- `file` → `encoding` (MediaObject)

**Additional fields for schema.org alignment:**

1. **Publisher** (for books, articles):
   ```typescript
   {
     name: 'publisher',
     type: 'relationship',
     relationTo: 'organizations',
   }
   ```
   Maps to: `schema.org/publisher`

2. **isPartOf** (for articles in journals, chapters in books):
   ```typescript
   {
     name: 'isPartOf',
     type: 'relationship',
     relationTo: 'sources', // Self-reference!
   }
   ```
   Maps to: `schema.org/isPartOf`

   **Example**: Article "Chapter 5" → isPartOf → Book "Complete Works"

3. **Publication Context** (for scholarly articles):
   ```typescript
   {
     name: 'publicationContext',
     type: 'group',
     fields: [
       { name: 'containerTitle', type: 'text' },  // Journal name
       { name: 'volume', type: 'text' },
       { name: 'issue', type: 'text' },
       { name: 'pageStart', type: 'text' },
       { name: 'pageEnd', type: 'text' },
     ]
   }
   ```
   Maps to: `schema.org/isPartOf` (Journal), `pageStart`, `pageEnd`, etc.

4. **Edition** (for books):
   ```typescript
   {
     name: 'edition',
     type: 'text',
   }
   ```
   Maps to: `schema.org/bookEdition`

**Decision for MVP:**
- ✅ Include: `publisher`, `isPartOf` (self-reference), `publicationContext`
- ⏸️ Defer: `edition` (can add later if needed)
- ❌ Not needed: `language` (CMS handles via localization)

**Rationale:**
- `publisher` is essential for proper citation
- `isPartOf` enables hierarchical sources (articles in journals, chapters in books)
- `publicationContext` enables academic citation formats (APA, MLA, Chicago)
- Self-referencing Sources → Sources allows modeling complex bibliographic relationships

## Implementation Checklist

- [x] Create `apps/historia/src/collections/Quotes.ts`
- [x] Create `apps/historia/src/collections/Sources.ts`
- [x] Register collections in `payload.config.ts`
- [x] Implement auto-title hook in Quotes (author → attributionText → "Quote")
- [x] Implement contributors array with roles in Sources
- [x] Implement conditional fields (accessedDate, publicationPlace, edition)
- [x] Implement identifiers array (type + value)
- [x] Test locator conditional display
- [x] Configure live preview with resourceId-only URLs
- [ ] Create frontend routes: `/i/quote/[resourceId]` and `/i/source/[resourceId]`
- [ ] Implement schema.org JSON-LD on frontend
- [ ] Generate TypeScript types
- [ ] Run database migrations
- [ ] Test in Historia admin UI
