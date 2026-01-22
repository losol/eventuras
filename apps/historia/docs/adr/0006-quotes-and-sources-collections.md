# ADR 0006 — Quotes and Sources Collections

## Status
Draft

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
- Public-facing quote pages with SEO
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

**1.1 Polymorphic Author Relationships**

```typescript
{
  name: 'authors',
  type: 'relationship',
  relationTo: ['persons', 'organizations'],
  hasMany: true,
}
```

**Rationale:**
- Organizations can be quoted (e.g., WHO policy statements, company announcements)
- Joint statements may have multiple authors (persons and/or organizations)
- Avoids separate fields for "person authors" vs "organization authors"

**Alternatives Considered:**
- Single person-only relationship → Too restrictive (excludes org quotes)
- Separate `personAuthors` and `orgAuthors` fields → More complex UI, harder queries

**1.2 Attribution System**

```typescript
{
  name: 'attributionType',
  type: 'select',
  options: ['confirmed', 'attributed', 'unknown'],
}
{
  name: 'attributionText',
  type: 'text',
}
```

**Rationale:**
- Many quotes have uncertain origins (e.g., "Often attributed to Mark Twain")
- Anonymous quotes are common ("Unknown", "Anonymous")
- Structured type enables filtering (show only confirmed quotes)
- Text field provides flexibility for nuanced attribution

**Alternatives Considered:**
- Only `attributionText` → Loses ability to filter/query by certainty
- Only `attributionType` → Can't express nuanced attribution details
- Boolean `isConfirmed` → Too simplistic (doesn't distinguish attributed from unknown)

**1.3 Auto-Generated Titles**

```typescript
hooks: {
  beforeValidate: [
    async ({ data, req }) => {
      // Generate: "Einstein, Bohr - #QUOT-123"
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
  name: 'type',
  type: 'select',
  options: [
    'book', 'article', 'speech', 'interview',
    'website', 'document', 'other'
  ]
}
```

**Rationale:**
- Different source types have different metadata needs
- Enables filtering (show all book sources)
- Extensible with "other" option

**2.2 File Upload Support**

```typescript
{
  name: 'file',
  type: 'upload',
  relationTo: 'media',
}
```

**Rationale:**
- Users may have PDFs of articles, speeches, etc.
- Enables self-contained knowledge base
- Optional (not all sources are downloadable)

**2.3 Polymorphic Authors**

Same pattern as Quotes — sources can have person or organization authors.

**2.4 Publisher Relationship**

```typescript
{
  name: 'publisher',
  type: 'relationship',
  relationTo: 'organizations',
}
```

**Rationale:**
- Essential for proper academic citations
- Reuses existing Organizations collection
- Schema.org `publisher` property

**2.5 Hierarchical Sources (isPartOf)**

```typescript
{
  name: 'isPartOf',
  type: 'relationship',
  relationTo: 'sources', // Self-reference!
}
```

**Rationale:**
- Enables modeling articles within journals, chapters within books
- Self-referencing allows complex bibliographic hierarchies
- Schema.org `isPartOf` property

**Examples:**
- Article "The Future of AI" → isPartOf → Journal "Nature"
- Chapter "Introduction" → isPartOf → Book "Complete Works"

**2.6 Publication Context**

```typescript
{
  name: 'publicationContext',
  type: 'group',
  admin: {
    condition: (data) => ['article', 'document'].includes(data.type),
  },
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
      name: 'pageStart',
      type: 'text',
    },
    {
      name: 'pageEnd',
      type: 'text',
    },
  ]
}
```

**Rationale:**
- Essential metadata for scholarly articles
- Enables generation of proper citations (APA, MLA, Chicago)
- Schema.org `isPartOf`, `pageStart`, `pageEnd` properties
- Conditional display (only for articles/documents)

**Alternatives Considered:**
- Use `isPartOf` relationship only → Loses structured metadata (volume, issue, pages)
- Both `isPartOf` + `publicationContext` → Flexibility for different use cases

**2.7 Public Pages with SEO**

Sources get their own slug and SEO tab.

**Rationale:**
- Source pages can display metadata + all quotes from that source
- SEO enables discovery (people searching for "quotes from X book")
- Creates hub pages for content organization

**Alternatives Considered:**
- Sources as pure metadata (no pages) → Misses SEO opportunity
- Sources embedded in Quotes → Duplication, no reusability

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

⚠️ **Polymorphic complexity** — Developers must handle person vs organization logic

⚠️ **Auto-title hook** — Requires async database calls in beforeValidate hook

### Mitigations

- **Query complexity** → Use Payload's populate/depth features
- **Admin overhead** → Add quick-create modals for sources (future)
- **Polymorphic logic** → Encapsulate in helper functions/utilities
- **Hook performance** → Consider caching author names (if needed)

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

- [ ] Create `apps/historia/src/collections/Quotes.ts`
- [ ] Create `apps/historia/src/collections/Sources.ts`
- [ ] Register collections in `payload.config.ts`
- [ ] Implement auto-title hook in Quotes
- [ ] Test polymorphic relationships (persons + organizations)
- [ ] Test attribution system (confirmed, attributed, unknown)
- [ ] Test locator conditional display
- [ ] Test live preview for both collections
- [ ] Create frontend routes: `/quotes/[slug]` and `/sources/[slug]`
- [ ] Generate TypeScript types
- [ ] Run database migrations (if needed)
- [ ] Update documentation
