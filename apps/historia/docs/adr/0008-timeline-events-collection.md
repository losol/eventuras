# ADR 0008 — Timeline Events Collection

## Status
Draft

## Context

A historical knowledge CMS needs structured representation of events across time. Users need to:

- Record historical events with precise or approximate dates
- Link events to people, places, organizations, and sources
- Visualize chronological sequences (interactive timelines)
- Provide historical context for articles and notes
- Support different date precisions (exact date, year only, circa, period)
- Enable filtering and searching by time periods
- Generate SEO-friendly event pages with schema.org markup

### Current Limitations

Without a dedicated Events/Timeline collection:

- ❌ No structured chronological data
- ❌ Events scattered across articles (hard to query)
- ❌ Can't generate timelines or temporal visualizations
- ❌ Missing connections between related historical events
- ❌ No standard way to represent date uncertainty
- ❌ Difficult to find "what happened in 1814?"

### Requirements

**Temporal Data:**
- Support exact dates (1814-05-17)
- Support year-only dates (1814)
- Support approximate dates ("early 1800s", "ca. 1850")
- Support date ranges (periods, ongoing events)
- Support BCE/CE dates

**Relationships:**
- Link to participants (persons, organizations)
- Link to locations (places)
- Link to related events (cause/effect, part of larger event)
- Link to authoritative sources
- Reference in articles/notes

**Categorization:**
- Event types (political, cultural, military, scientific, etc.)
- Importance/significance level
- Geographic scope (local, national, international)

**Presentation:**
- Public event pages with full context
- Timeline visualization (JSON export)
- Integration in articles (inline event cards)
- Chronological browsing

## Decision

Implement an **Events collection** (slug: `events`) with flexible date representation and rich semantic relationships.

### Versioning Strategy

**Full versioning enabled:**
- **Rationale:** Historical research updates understanding of events
- **Example:** "Slaget ved Stiklestad" - dating and participant details are debated
- **New sources:** Archaeological finds or document discoveries can change established facts
- **Scholarly integrity:** Researchers can cite specific interpretations
- **Configuration:**
  ```typescript
  versions: {
    drafts: {
      autosave: true,
    },
    maxPerDoc: 50,
  }
  ```

### Multi-Tenancy Strategy

**Organization-scoped:** Timeline events are isolated per organization.

- **Rationale:** Organizations curate their own historical narratives and interpretations
- **No cross-tenant sharing:** Each organization maintains their own timeline
- **Use case:** Company history, project milestones, discipline-specific chronologies
- **Different interpretations:** Multiple organizations can have different versions of the same historical event
- **Implementation:** Handled by multiTenantPlugin - adds tenant field and filters queries automatically
- **Access control:** Collection uses standard access patterns; plugin enforces tenant isolation at query level

### Collection Structure

```typescript
import type { CollectionConfig } from 'payload';

import { admins } from '@/access/admins';
import { anyone } from '@/access/anyone';
import { siteEditors } from '@/access/siteRoleAccess';
import { accessOR } from '@/access/utils/accessOR';
import { Content } from '@/blocks/Content/config';
import { Image } from '@/blocks/Image/config';
import { image } from '@/fields/image';
import resourceId from '@/fields/resourceId';
import { slugField } from '@/fields/slug';
import { storyField } from '@/fields/story';
import { seoTab } from '@/lib/payload-plugin-seo';

export const Events: CollectionConfig = {
  slug: 'events',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'startDate', 'eventType', 'updatedAt'],
    defaultSort: 'startDate',
  },
  versions: {
    drafts: {
      autosave: true,
    },
    maxPerDoc: 50,
  },
  fields: [
    {
      type: 'tabs',
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            // Event identification
            {
              name: 'title',
              type: 'text',
              required: true,
              localized: true,
              label: 'Event Title',
              admin: {
                description: 'Short, descriptive title (e.g., "Grunnloven undertegnes", "French Revolution begins")',
              },
            },

            // Rich description
            storyField([Content, Image]),

            // Short summary
            {
              name: 'summary',
              type: 'textarea',
              maxLength: 300,
              localized: true,
              label: 'Summary',
              admin: {
                description: 'Brief summary for timeline tooltips and previews (max 300 characters)',
              },
            },

            // Featured image (reuses shared image field pattern from Articles)
            image,


            // Date/Time group
            {
              name: 'temporal',
              type: 'group',
              label: 'Date & Time',
              fields: [
                {
                  name: 'startDate',
                  type: 'date',
                  required: true,
                  label: 'Start Date',
                  admin: {
                    description: 'Date when event began (or occurred for single-day events)',
                    date: {
                      pickerAppearance: 'dayAndTime',
                    },
                  },
                },
                {
                  name: 'endDate',
                  type: 'date',
                  label: 'End Date',
                  admin: {
                    description: 'Optional end date for events spanning multiple days/years',
                    condition: (data) => !!data.temporal?.startDate,
                  },
                },
                {
                  name: 'datePrecision',
                  type: 'select',
                  required: true,
                  defaultValue: 'exact',
                  label: 'Date Precision',
                  options: [
                    { label: 'Exact (day)', value: 'exact' },
                    { label: 'Month', value: 'month' },
                    { label: 'Year', value: 'year' },
                    { label: 'Decade', value: 'decade' },
                    { label: 'Century', value: 'century' },
                    { label: 'Circa (approximate)', value: 'circa' },
                  ],
                  admin: {
                    description: 'How precise is the date?',
                  },
                },
                {
                  name: 'displayDate',
                  type: 'text',
                  localized: true,
                  label: 'Display Date (override)',
                  admin: {
                    description: 'Optional human-readable date (e.g., "Early 1800s", "Spring 1814", "ca. 1850"). Overrides auto-formatted date.',
                  },
                },
                {
                  name: 'isOngoing',
                  type: 'checkbox',
                  defaultValue: false,
                  label: 'Ongoing Event',
                  admin: {
                    description: 'Check if event is still happening (no end date)',
                  },
                },
              ],
            },

            // Location
            {
              name: 'location',
              type: 'relationship',
              relationTo: 'places',
              label: 'Location',
              admin: {
                description: 'Where did this event take place?',
              },
            },

            // Participants
            {
              name: 'participants',
              type: 'array',
              label: 'Participants',
              admin: {
                description: 'People and organizations involved in this event',
              },
              fields: [
                {
                  name: 'entity',
                  type: 'relationship',
                  relationTo: ['persons', 'organizations'],
                  required: true,
                  label: 'Person/Organization',
                },
                {
                  name: 'role',
                  type: 'text',
                  label: 'Role',
                  admin: {
                    description: 'Their role in the event (e.g., "signatory", "commander", "victim", "witness")',
                  },
                },
              ],
            },

            // Sources
            {
              name: 'sources',
              type: 'relationship',
              relationTo: 'sources',
              hasMany: true,
              label: 'Sources',
              admin: {
                description: 'Historical sources documenting this event',
              },
            },

            // Topics/categories
            {
              name: 'topics',
              type: 'relationship',
              relationTo: 'topics',
              hasMany: true,
              label: 'Topics',
              admin: {
                description: 'Thematic categories (e.g., "Norwegian Constitution", "World War II")',
              },
            },

            // Resource ID + slug
            ...slugField(),
            resourceId,
          ],
        },
        {
          label: 'SEO',
          fields: [seoTab],
        },
      ],
    },
  ],
}
```

### Key Design Decisions

#### 1. Flexible Date Precision

**Problem:** Historical dates are often uncertain or imprecise.

**Solution:** `datePrecision` field + optional `displayDate` override

```typescript
{
  temporal: {
    startDate: '1850-01-01', // Stored as ISO date
    datePrecision: 'circa',
    displayDate: 'ca. 1850',
  }
}
```

**Date Precision Levels:**
- **Exact:** 1814-05-17 (day precision)
- **Month:** May 1814
- **Year:** 1814
- **Decade:** 1810s
- **Century:** 19th century
- **Circa:** ca. 1850 (approximate)

**Rationale:**
- Store dates as ISO 8601 for sorting/filtering
- Display date respects historical uncertainty
- Supports both modern (exact) and ancient (approximate) events

**Alternatives Considered:**
- Separate "circa" field → Less flexible
- Text-only dates → Can't sort chronologically
- BC/AD enum → Handled by negative years in ISO

#### 2. Event Relationships (Causal Chain)

```typescript
{
  name: 'relatedEvents',
  fields: [
    { event: relationship },
    { relationshipType: 'caused_by' | 'led_to' | 'part_of' | ... }
  ]
}
```

**Rationale:**
- History is causal chains ("French Revolution → Napoleon")
- "Part of" enables hierarchical events (battles in a war)
- "Concurrent with" links parallel timelines
- Enables graph visualization

**Example:**
```
Event: "Grunnloven undertegnes" (1814-05-17)
Related Events:
  - caused_by: "Kiel-traktaten" (1814-01-14)
  - led_to: "Norge i union med Sverige" (1814-11-04)
  - part_of: "Napoleonskrigene" (1803-1815)
```

**Alternatives Considered:**
- Untyped relationships → Loses semantic meaning
- Separate fields per type → Too complex
- Bidirectional enforcement → Too rigid

#### 3. Participants Array with Roles

```typescript
{
  participants: [
    { entity: Person/Organization, role: 'signatory' },
    { entity: Person, role: 'witness' },
  ]
}
```

**Rationale:**
- Events involve multiple actors with different roles
- Polymorphic (persons and organizations)
- Roles provide context ("victim" vs "perpetrator")
- Open-ended role field (not enum) for flexibility

**Example:**
```
Event: "Grunnloven undertegnes"
Participants:
  - Christian Frederik (role: "regent")
  - Peder Anker (role: "president")
  - Eidsvollsmennene (org) (role: "assembly members")
```

**Alternatives Considered:**
- Separate persons/organizations fields → Loses polymorphism
- Enum roles → Too restrictive (historical roles vary)
- No roles → Loses important context

#### 4. Geographic Scope Field

```typescript
{
  name: 'geographicScope',
  type: 'select',
  options: ['local', 'regional', 'national', 'international', 'global']
}
```

**Rationale:**
- Location is "where", scope is "how widely it mattered"
- Enables filtering ("show me global events")
- Helps prioritize in timelines (show critical + international)
- Separate from location (Pearl Harbor = local place, global scope)

**Example:**
- "Grunnloven undertegnes": national
- "Treaty of Versailles": international
- "Moon landing": global

**Alternatives Considered:**
- Infer from significance → Not always correlated
- Omit → Loses important categorization

#### 5. Duration Support (Start + End Date)

```typescript
{
  startDate: '1939-09-01',
  endDate: '1945-05-08',
  isOngoing: false,
}
```

**Rationale:**
- Many historical events span time (wars, reigns, movements)
- Single-day events: only startDate
- Periods: startDate + endDate
- Current events: startDate + isOngoing

**Timeline Rendering:**
- Point events: markers
- Duration events: bars/spans
- Ongoing: open-ended bars

**Alternatives Considered:**
- Only single dates → Can't represent periods
- Separate "Period" collection → Over-engineered

#### 6. Summary Field for Timeline Tooltips

```typescript
{
  name: 'summary',
  type: 'textarea',
  maxLength: 300,
}
```

**Rationale:**
- Timeline tooltips need brief text
- RichText description too complex for tooltips
- 300 characters = ~50 words (concise but informative)
- Separate from description (different use cases)

**Alternatives Considered:**
- Auto-extract from description → Unreliable truncation
- Use title only → Too minimal, no context
- Longer limit → Defeats purpose of tooltip

#### 7. Significance/Importance Field

```typescript
{
  name: 'significance',
  type: 'select',
  options: ['critical', 'high', 'medium', 'low']
}
```

**Rationale:**
- Enables "show only major events" timeline view
- Helps prioritize in condensed visualizations
- Editorial judgment (not automatic)
- Combined with geographicScope for filtering

**Example Timeline Filters:**
- "Critical + Global" → World wars, major inventions
- "High + National" → Norwegian independence milestones
- "All significance + Local" → Full regional history

**Alternatives Considered:**
- Numeric importance (1-10) → Too granular, hard to calibrate
- Boolean "major event" → Too coarse
- Omit → Timelines become cluttered

### Schema.org Mapping

Events map to [`schema.org/Event`](https://schema.org/Event):

```json
{
  "@context": "https://schema.org",
  "@type": "Event",
  "name": "Grunnloven undertegnes",
  "description": "...",
  "startDate": "1814-05-17",
  "location": {
    "@type": "Place",
    "name": "Eidsvoll"
  },
  "organizer": [
    {
      "@type": "Person",
      "name": "Christian Frederik"
    }
  ],
  "about": {
    "@type": "Thing",
    "name": "Norwegian Constitution"
  }
}
```

**Property Mappings:**
- `title` → `name`
- `description` → `description`
- `temporal.startDate` → `startDate`
- `temporal.endDate` → `endDate`
- `location` → `location` (Place)
- `participants` → `organizer` or `attendee`
- `eventType` → `@type` subclass (e.g., PoliticalEvent - proposed extension)

## Consequences

### Positive

✅ **Chronological queries** — "What happened in 1814?"

✅ **Timeline visualization** — Interactive timelines with filters

✅ **Historical context** — Connect events to people, places, sources

✅ **Flexible dates** — Supports uncertain/approximate historical dates

✅ **Causal chains** — "This led to that" relationships

✅ **Multiple granularities** — Single days to multi-year periods

✅ **SEO value** — Event pages with schema.org markup

### Negative

⚠️ **Complexity** — Many fields (temporal, participants, relationships)

⚠️ **Date ambiguity** — displayDate can conflict with actual date

⚠️ **Curation overhead** — Linking related events requires research

⚠️ **Precision decisions** — Editors must choose appropriate datePrecision

⚠️ **Significance subjectivity** — "Critical" vs "High" is editorial judgment

### Mitigations

- **Templates** — Pre-fill common event types
- **Validation** — Warn if endDate < startDate
- **Defaults** — datePrecision = 'exact', significance = 'medium'
- **Guidelines** — Clear documentation on significance levels
- **Optional fields** — Only title, startDate, eventType required

## Future Enhancements (Out of Scope)

**Advanced Temporal:**
- BCE/CE display toggle
- Multiple calendar systems (Julian, Gregorian)
- Seasonal/astronomical dates ("Spring 1814")

**Visualization:**
- Interactive timeline component
- Timeline embedding in articles
- Map view (events on geographic map)
- Network graph (causal relationships)

**Rich Features:**
- Media gallery (photos, paintings of event)
- Contemporary quotes about event
- Alternate perspectives (different sources)
- Counterfactual analysis

**Integration:**
- Auto-link events in article text
- "On this day in history" widget
- Timeline comparison (parallel histories)
- Export to Timeline.js format

**Advanced Relationships:**
- Weighted relationships (strong vs weak causal links)
- Contested causality ("historians debate whether X caused Y")
- Multiple interpretations

## Alternatives Considered

### Alternative 1: Simple Date + Title Only

Minimal structure: title, date, description.

**Pros:**
- Simple to implement
- Easy for editors

**Cons:**
- Can't filter by type, scope, significance
- No causal relationships
- No participant tracking
- Loses semantic richness

**Why Rejected:** Too minimal for historical knowledge base

### Alternative 2: Separate "Period" Collection

Events for single points, Periods for durations.

**Pros:**
- Clear separation
- Simpler individual structures

**Cons:**
- Many events span time (wars, reigns)
- Arbitrary distinction
- Duplication of fields

**Why Rejected:** Duration is a property of events, not a separate type

### Alternative 3: Typed Event Subclasses

Separate collections: PoliticalEvents, MilitaryEvents, etc.

**Pros:**
- Tailored fields per type
- Cleaner schemas

**Cons:**
- Fragmentation (hard to query all events)
- Duplication of common fields
- Events often span types (political + military)

**Why Rejected:** Single collection with type field is more flexible

### Alternative 4: ISO 8601 Period Strings

Store dates as "1939-09-01/1945-05-08" strings.

**Pros:**
- Standard format
- Single field

**Cons:**
- Harder to query/sort
- Doesn't support precision levels
- No display override

**Why Rejected:** Separate fields + precision enum is clearer

## Implementation Checklist

- [ ] Create `apps/historia/src/collections/Events.ts`
- [ ] Register collection in `payload.config.ts`
- [ ] Implement date validation (endDate >= startDate)
- [ ] Add to localized collection name mapping (events/hendelser)
- [ ] Create frontend route: `/[locale]/c/event/[slug]`
- [ ] Implement schema.org Event JSON-LD
- [ ] Create event page component (full details + timeline visualization)
- [ ] Implement date formatting based on precision
- [ ] Display participants with roles
- [ ] Display related events (causal graph)
- [ ] Add timeline export endpoint (JSON for visualization libraries)
- [ ] Test various date precisions
- [ ] Test event relationships
- [ ] Generate TypeScript types
- [ ] Run database migrations
- [ ] Update documentation

## References

- [schema.org/Event](https://schema.org/Event)
- [ISO 8601 Date/Time](https://en.wikipedia.org/wiki/ISO_8601)
- [CIDOC-CRM Event Model](https://www.cidoc-crm.org/) (museum standard)
- [Timeline.js](https://timeline.knightlab.com/) (visualization library)
- [PeriodO](https://perio.do/) (period gazetteer)
- ADR 0006 - Quotes and Sources (relationship patterns)
- ADR 0007 - Terms/Glossary (semantic network patterns)
