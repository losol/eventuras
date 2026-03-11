# E2E Test Utils

This directory contains reusable utility functions for E2E testing with Playwright.

## Overview

The utils are organized by functionality:

- **eventCreation.ts**: Functions for creating test events
- **testEventData.ts**: Rich test data generators for realistic event content

## Usage

### Creating Events with Rich Content

```typescript
import { createTestEvent } from '../utils';

// Create event with rich markdown content (default)
const eventId = await createTestEvent(page, 'My Test Event');

// Create event with minimal content (faster)
const eventId = await createTestEvent(page, 'My Test Event', {
  useRichContent: false,
});

// Create event with custom data
const eventId = await createTestEvent(page, 'My Test Event', {
  customData: {
    maxParticipants: 100,
    city: 'Oslo',
  },
});
```

### Using Test Data Generators

```typescript
import { generateTestEventData, generateMinimalTestEventData } from '../e2e-utils';

// Generate rich test data
const richData = generateTestEventData('My Event Name');
console.log(richData.program); // Contains markdown with headings, lists, etc.

// Generate minimal test data
const minimalData = generateMinimalTestEventData('My Event Name');
console.log(minimalData.program); // Simple text
```

## Why Rich Content?

Rich markdown content in tests helps catch:

- **Formatting issues**: Headings, lists, bold/italic text
- **Layout problems**: Spacing, margins, padding
- **Rendering bugs**: Missing or broken markdown elements
- **Accessibility issues**: Proper HTML structure from markdown

The rich test data includes:

- Multiple heading levels (h2, h3)
- Ordered and unordered lists
- Bold and italic text
- Blockquotes
- Horizontal rules
- Links with proper security attributes
- Emojis and special characters

## Performance

- **Rich content**: Use for thorough testing of public pages (~5-10s slower)
- **Minimal content**: Use for quick tests that don't need markdown validation

## Examples

See the following test files for usage examples:

- `001-admin-event-create-registration.spec.ts` - Uses rich content by default
- `004-public-event-markdown-rendering.spec.ts` - Validates markdown rendering
