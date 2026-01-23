# ADR 0005 — Schema-Driven Resources System

## Status
Draft

## Context

Historia needs to support structured document storage beyond traditional CMS content like articles and pages. Organizations need to store and manage various types of schema-driven data:

- **Collaboration frameworks** (Team Canvas, Business Model Canvas, Lean Canvas)
- **Health questionnaires** (FHIR Questionnaires for mental health, intake forms)
- **Assessment frameworks** (Step-Up frameworks, evaluation tools)
- **Datasets and statistics** (Time-series data, historical statistics, demographic data)
- **Custom structured data** (Organization-specific schemas)

**Current Limitations:**

1. **No generic document store** — Each new type requires a new Payload collection with custom fields
2. **No schema validation** — No standardized way to validate structured data
3. **No template sharing** — Organizations can't create reusable templates
4. **Tight coupling** — Adding support for new document types requires code changes

**Use Cases:**

- Teams want to collaboratively fill out a Team Canvas and store it
- Health organizations need to collect FHIR-compliant questionnaire responses
- Consultants want to create assessment templates and share them with clients
- Historians need to store and visualize statistical data (e.g., "Folkemengde i Norge 1801-1900")
- Organizations want to build custom structured forms without coding

**Requirements:**

- Support arbitrary JSON schemas (not hardcoded fields)
- Allow organizations to create and share templates
- Flexible visibility controls (private, team, logged-in, public)
- Version history for audit trails
- No frontend editing required in initial version (headless/API-first)
- Schemas and templates should be reusable across organizations

## Decision

### Architecture Overview

Introduce three new Payload collections to enable schema-driven resource management:

```
┌─────────────────────────┐
│  Resource Schemas       │  ← Technical validation (JSON Schema)
│  (admin-managed)        │     Reusable across all organizations
└──────────┬──────────────┘
           │
           │ used by
           ▼
┌─────────────────────────┐
│  Resource Templates     │  ← Pre-filled templates with metadata
│  (user-created)         │     Can be shared publicly or per-org
└──────────┬──────────────┘
           │
           │ instantiated as
           ▼
┌─────────────────────────┐
│  Resources              │  ← Actual user data (JSON documents)
│  (user-created)         │     Validated against schemas
└─────────────────────────┘
```

### Versioning Strategy

**Full versioning enabled** for Resources collection:
- **Rationale:** Datasets and statistical data are updated when new sources are discovered or historical research progresses
- **Academic integrity:** Researchers must be able to reference specific versions
- **Auditability:** Track how data has evolved over time
- **Configuration:**
  ```typescript
  versions: {
    drafts: {
      autosave: true,
    },
    maxPerDoc: 50,
  }
  ```

**Draft/published only** for ResourceSchemas and ResourceTemplates:
- Schemas and templates need review workflow but full history less critical
- Configuration: `versions: { drafts: true }`

### Multi-Tenancy Strategy

**Organization-scoped:** All data (Resources, Templates, Schemas) is isolated per organization.

- **Rationale:** Team canvases, questionnaires, and datasets are organization-specific
- **No cross-tenant sharing:** Each organization has their own schemas, templates, and data
- **Data isolation:** Users can only access resources belonging to their organization
- **Implementation:** Handled at config level via tenant isolation plugin/hooks (organization field auto-managed)

### 1. Resource Schemas Collection

**Purpose:** Define the technical structure and validation rules for different resource types.

**Managed by:** System administrators or power users
**Shared:** Globally available across all organizations

```typescript
export const ResourceSchemas: CollectionConfig = {
  slug: 'resource-schemas',
  admin: {
    group: 'System',
    description: 'Define JSON schemas for resource types'
  },
  access: {
    read: ({ req }) => {
      if (!req.user) return false;
      return {
        organization: { equals: req.user.organization },
      };
    },
    create: isSystemAdmin,
    update: isSystemAdmin,
    delete: isSystemAdmin
  },
  fields: [
    {
      name: 'schemaId',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Unique identifier (e.g., "team-canvas-v1", "fhir-questionnaire-r4")'
      }
    },
    {
      name: 'version',
      type: 'text',
      required: true,
      admin: {
        description: 'Semantic version (e.g., "1.0.0")'
      }
    },
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'Human-readable name (e.g., "Team Canvas")'
      }
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Explain what this schema is for and when to use it'
      }
    },
    {
      name: 'category',
      type: 'select',
      options: [
        { label: 'Collaboration Canvas', value: 'canvas' },
        { label: 'Health & Wellbeing', value: 'health' },
        { label: 'Assessment Framework', value: 'framework' },
        { label: 'Dataset / Statistics', value: 'dataset' },
        { label: 'Other', value: 'other' }
      ],
      admin: {
        description: 'Category for organizing schemas'
      }
    },
    {
      name: 'jsonSchema',
      type: 'json',
      required: true,
      admin: {
        description: 'JSON Schema (draft-07 or later) defining the structure'
      }
    },
    {
      name: 'uiSchema',
      type: 'json',
      admin: {
        description: 'UI hints for external editors (e.g., react-jsonschema-form)'
      }
    },
    {
      name: 'exampleData',
      type: 'json',
      admin: {
        description: 'Example document conforming to this schema (for testing/documentation)'
      }
    }
  ]
}
```

**Example Schema 1: Team Canvas**
```json
{
  "schemaId": "team-canvas-v1",
  "version": "1.0.0",
  "name": "Team Canvas",
  "category": "canvas",
  "jsonSchema": {
    "type": "object",
    "required": ["purpose", "values"],
    "properties": {
      "purpose": {
        "type": "string",
        "title": "Team Purpose"
      },
      "values": {
        "type": "array",
        "title": "Shared Values",
        "items": { "type": "string" }
      },
      "goals": {
        "type": "array",
        "title": "Goals",
        "items": {
          "type": "object",
          "properties": {
            "goal": { "type": "string" },
            "deadline": { "type": "string", "format": "date" }
          }
        }
      }
    }
  }
}
```

**Example Schema 2: Time-Series Dataset**
```json
{
  "schemaId": "time-series-v1",
  "version": "1.0.0",
  "name": "Time-Series Dataset",
  "category": "dataset",
  "description": "For historical statistics, demographic data, and time-based measurements",
  "jsonSchema": {
    "type": "object",
    "required": ["title", "series"],
    "properties": {
      "title": {
        "type": "string",
        "title": "Dataset Title"
      },
      "description": {
        "type": "string",
        "title": "Description"
      },
      "sourceId": {
        "type": "string",
        "title": "Source Reference",
        "description": "ID of Source document (from Sources collection)"
      },
      "unit": {
        "type": "string",
        "title": "Unit of Measurement",
        "examples": ["persons", "NOK", "degrees Celsius"]
      },
      "series": {
        "type": "array",
        "title": "Data Points",
        "items": {
          "type": "object",
          "required": ["date", "value"],
          "properties": {
            "date": {
              "type": "string",
              "format": "date",
              "title": "Date or Year"
            },
            "value": {
              "type": "number",
              "title": "Value"
            },
            "label": {
              "type": "string",
              "title": "Optional Label"
            },
            "note": {
              "type": "string",
              "title": "Optional Note"
            }
          }
        }
      },
      "visualization": {
        "type": "object",
        "title": "Visualization Config",
        "properties": {
          "chartType": {
            "type": "string",
            "enum": ["line", "bar", "area", "scatter"],
            "default": "line"
          },
          "xAxisLabel": {
            "type": "string",
            "default": "Time"
          },
          "yAxisLabel": {
            "type": "string"
          },
          "showPoints": {
            "type": "boolean",
            "default": true
          },
          "interpolation": {
            "type": "string",
            "enum": ["linear", "step", "smooth"],
            "default": "linear"
          }
        }
      }
    }
  },
  "uiSchema": {
    "series": {
      "ui:options": {
        "orderable": true,
        "addable": true,
        "removable": true
      }
    }
  },
  "exampleData": {
    "title": "Folkemengde i Norge 1801-1900",
    "description": "Historisk befolkningsutvikling i Norge på 1800-tallet",
    "sourceId": "SRC-ssb-befolkning-historisk",
    "unit": "personer",
    "series": [
      { "date": "1801-01-01", "value": 883000, "label": "1801" },
      { "date": "1825-01-01", "value": 1051000, "label": "1825" },
      { "date": "1850-01-01", "value": 1490000, "label": "1850" },
      { "date": "1875-01-01", "value": 1813000, "label": "1875" },
      { "date": "1900-01-01", "value": 2240000, "label": "1900" }
    ],
    "visualization": {
      "chartType": "line",
      "xAxisLabel": "År",
      "yAxisLabel": "Folkemengde",
      "showPoints": true
    }
  }
}
```

### 2. Resource Templates Collection

**Purpose:** Pre-configured templates with default data and metadata, created by users or admins.

**Managed by:** Any authenticated user
**Shared:** Can be private to an organization or publicly available

```typescript
export const ResourceTemplates: CollectionConfig = {
  slug: 'resource-templates',
  admin: {
    group: 'Resources',
    description: 'Reusable templates with default data and descriptions'
  },
  access: {
    read: () => true,  // All public templates visible
    create: isAuthenticated,
    update: isOwnerOrAdmin,
    delete: isOwnerOrAdmin
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'Template name (e.g., "Team Canvas - Project Kickoff")'
      }
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Explain what this template is for and when to use it'
      }
    },
    {
      name: 'schema',
      type: 'relationship',
      relationTo: 'resource-schemas',
      required: true,
      admin: {
        description: 'The schema this template conforms to'
      }
    },
    {
      name: 'defaultData',
      type: 'json',
      admin: {
        description: 'Pre-filled values and placeholder text'
      }
    },
    {
      name: 'isPublic',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Allow other organizations to use this template'
      }
    },
    {
      name: 'organization',
      type: 'relationship',
      relationTo: 'organizations',
      admin: {
        description: 'Organization that owns this template (optional for global templates)'
      }
    },
    {
      name: 'tags',
      type: 'array',
      fields: [
        { name: 'tag', type: 'text' }
      ],
      admin: {
        description: 'Tags for searching and filtering'
      }
    }
  ]
}
```

**Example Template:**
```json
{
  "name": "Team Canvas - Project Kickoff",
  "schema": "team-canvas-v1",
  "isPublic": true,
  "defaultData": {
    "purpose": "Define your team's purpose and reason for existence...",
    "values": [
      "Example: Collaboration",
      "Example: Innovation",
      "Example: Customer Focus"
    ],
    "goals": [
      {
        "goal": "Example: Launch MVP by Q2",
        "deadline": "2026-06-30"
      }
    ]
  }
}
```

### 3. Resources Collection

**Purpose:** Actual user-created documents with flexible visibility controls and versioning.

**Managed by:** Any authenticated user
**Visibility:** Configurable per resource (private, team, logged-in, public)

```typescript
export const Resources: CollectionConfig = {
  slug: 'resources',
  admin: {
    group: 'Resources',
    useAsTitle: 'title',
    description: 'Schema-driven structured documents'
  },
  versions: {
    maxPerDoc: 50,
    drafts: true
  },
  access: {
    read: ({ req: { user }, data }) => {
      // Public: anyone can view
      if (data?.visibility === 'public') return true;

      // Not logged in: only public
      if (!user) return false;

      // System admin: see everything
      if (user.roles?.includes('system-admin')) return true;

      // Logged-in: all authenticated users
      if (data?.visibility === 'logged-in') return true;

      // Team: owner + collaborators
      if (data?.visibility === 'team') {
        return (
          data.owner === user.id ||
          data.collaborators?.some(c => c.user === user.id)
        );
      }

      // Private: only owner
      if (data?.visibility === 'private') {
        return data.owner === user.id;
      }

      return false;
    },
    create: isAuthenticated,
    update: ({ req: { user }, data }) => {
      // Owner or system admin can always update
      if (user.roles?.includes('system-admin')) return true;
      if (data?.owner === user.id) return true;

      // Collaborators with 'editor' role can update
      return data?.collaborators?.some(
        c => c.user === user.id && c.role === 'editor'
      );
    },
    delete: ({ req: { user }, data }) => {
      // Only owner or system admin can delete
      return (
        user.roles?.includes('system-admin') ||
        data?.owner === user.id
      );
    }
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'Resource title (e.g., "Our Team Canvas Q1 2026")'
      }
    },
    {
      name: 'schema',
      type: 'relationship',
      relationTo: 'resource-schemas',
      required: true,
      admin: {
        description: 'Schema this resource conforms to'
      }
    },
    {
      name: 'template',
      type: 'relationship',
      relationTo: 'resource-templates',
      admin: {
        description: 'Template used to create this resource (optional)'
      }
    },
    {
      name: 'data',
      type: 'json',
      required: true,
      admin: {
        description: 'The actual resource data (validated against schema)'
      }
    },

    // Sharing & Access Control
    {
      name: 'visibility',
      type: 'select',
      required: true,
      defaultValue: 'private',
      options: [
        { label: 'Private - Only me', value: 'private' },
        { label: 'Team - Me and collaborators', value: 'team' },
        { label: 'Logged in - All authenticated users', value: 'logged-in' },
        { label: 'Public - Anyone with the link', value: 'public' }
      ],
      admin: {
        description: 'Who can view this resource'
      }
    },
    {
      name: 'organization',
      type: 'relationship',
      relationTo: 'organizations',
      admin: {
        description: 'Organization this resource belongs to (optional)'
      }
    },
    {
      name: 'owner',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        readOnly: true,
        description: 'Resource owner (automatically set)'
      }
    },
    {
      name: 'collaborators',
      type: 'array',
      admin: {
        condition: (data) => data.visibility === 'team' || data.visibility === 'private',
        description: 'Users who can view/edit this resource'
      },
      fields: [
        {
          name: 'user',
          type: 'relationship',
          relationTo: 'users',
          required: true
        },
        {
          name: 'role',
          type: 'select',
          required: true,
          options: [
            { label: 'Editor - Can edit', value: 'editor' },
            { label: 'Viewer - Read only', value: 'viewer' }
          ]
        }
      ]
    },

    // Metadata
    {
      name: 'description',
      type: 'textarea',
      admin: {
        condition: (data) => data.visibility !== 'private',
        description: 'Shown when resource is shared'
      }
    },
    {
      name: 'tags',
      type: 'array',
      fields: [
        { name: 'tag', type: 'text' }
      ],
      admin: {
        description: 'Tags for searching and organizing'
      }
    }
  ],
  hooks: {
    beforeValidate: [
      // Set owner to current user on creation
      async ({ operation, data, req }) => {
        if (operation === 'create' && req.user) {
          data.owner = req.user.id;
        }
        return data;
      }
    ],
    beforeChange: [
      // Validate data against JSON Schema
      async ({ data, req, operation }) => {
        if (data.schema && data.data) {
          const schema = await req.payload.findByID({
            collection: 'resource-schemas',
            id: data.schema
          });

          if (schema?.jsonSchema) {
            // TODO: Implement JSON Schema validation
            // Using ajv or similar library
            // Throw error if validation fails
          }
        }
        return data;
      }
    ]
  }
}
```

### Visibility Levels

| Level | Who Can View | Example Use Case |
|-------|-------------|------------------|
| `private` | Only owner | Personal draft, sensitive data |
| `team` | Owner + collaborators | Team Canvas for project team |
| `logged-in` | All authenticated users | Shared framework, learning resources |
| `public` | Anyone (including anonymous) | Public case study, documentation |

### Data Flow

```
1. Admin creates schema
   ↓
2. User (or admin) creates template based on schema
   ↓
3. User instantiates template → creates resource
   ↓
4. User fills in data (via external app or API)
   ↓
5. Resource saved, validated against schema
   ↓
6. Resource shared based on visibility setting
```

## Consequences

### Positive

✅ **No code changes for new types** — New schemas can be added without deploying code
✅ **Reusable templates** — Organizations can share best practices
✅ **Flexible visibility** — Four levels cover most sharing scenarios
✅ **Validation built-in** — JSON Schema ensures data integrity
✅ **Version history** — Payload's built-in versioning tracks changes
✅ **Headless-first** — Works via API, UI can be added later
✅ **Multi-tenant friendly** — Resources belong to organizations
✅ **Separation of concerns** — Schema, template, and data are decoupled

### Negative

❌ **No frontend editor initially** — Users need external tools or API knowledge
❌ **Schema validation requires library** — Need to add `ajv` or similar
❌ **More complex data model** — Three collections instead of one
❌ **Performance consideration** — JSON Schema validation on every save

### Risks & Mitigations

**Risk:** Users create invalid JSON data
**Mitigation:** Implement strict JSON Schema validation in `beforeChange` hook

**Risk:** Large JSON documents impact performance
**Mitigation:** Consider size limits (e.g., max 1MB per resource)

**Risk:** Schema changes break existing resources
**Mitigation:** Schema versioning (new schema versions, not updates)

**Risk:** No frontend editor hurts adoption
**Mitigation:** Document API clearly, consider react-jsonschema-form integration later

## Implementation Plan

### Phase 1: Core Collections (MVP)
- [ ] Create `resource-schemas` collection
- [ ] Create `resource-templates` collection
- [ ] Create `resources` collection
- [ ] Add JSON Schema validation (ajv library)
- [ ] Add owner auto-assignment hook
- [ ] Write API documentation

### Phase 2: Example Schemas
- [ ] Create Team Canvas schema + template
- [ ] Create FHIR Questionnaire schema + template
- [ ] Document schema creation guide

### Phase 3: Frontend Integration (Future)
- [ ] Generic JSON Schema form renderer
- [ ] Custom editors for common types (Canvas, FHIR)
- [ ] Template browser UI
- [ ] Resource gallery (public resources)

## References

- [JSON Schema Specification](https://json-schema.org/)
- [Payload CMS Collections](https://payloadcms.com/docs/configuration/collections)
- [Payload CMS Versions](https://payloadcms.com/docs/versions/overview)
- [FHIR Questionnaire Resource](https://www.hl7.org/fhir/questionnaire.html)
- [Team Canvas PDF](https://andiroberts.com/wp-content/uploads/2020/03/Team-Canvas-v.-0.8.pdf)
- [react-jsonschema-form](https://github.com/rjsf-team/react-jsonschema-form)

## Future Enhancements

### Export/Import
- Export resources as JSON files
- Import resources from external systems
- Bulk operations

### Advanced Collaboration
- Real-time collaborative editing (via WebSockets)
- Comment threads on specific fields
- Activity feed per resource

### Schema Registry
- Public schema registry (like schema.org)
- Schema discovery and browsing
- Schema inheritance and composition

### Analytics
- Resource usage statistics
- Popular templates
- Schema adoption metrics

---

**This ADR establishes the foundation for Historia as a flexible document store supporting arbitrary structured data types while maintaining data integrity through JSON Schema validation.**
