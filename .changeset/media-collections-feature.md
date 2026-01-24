---
"@eventuras/historia": minor
---

Add Media Collections for organizing media assets

Implements a new Media Collections collection (slug: `media-collections`) for organizing media assets:

- Named collections with localized names and descriptions
- Optional hierarchical structure (collections can have parent collections)
- Auto-generated slugs for URL-friendly references
- Circular reference prevention to avoid invalid parent-child relationships
- Backward compatible: existing media remains uncategorized

Media now has an optional `collection` field to assign it to a collection.

Enables better organization as media library grows, with support for folder-like structures (e.g., "Marketing > Social Media > 2025").

See ADR 0009 for architectural decisions and future ACL implementation plans.
