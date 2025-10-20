# @eventuras/core

Core utilities for Eventuras applications.

## Features

### Regex Patterns

Common validation regex patterns for form validation and data processing.

#### Usage

```typescript
// Import specific patterns from @eventuras/core/regex
import { internationalPhoneNumber, lettersSpaceAndHyphen } from '@eventuras/core/regex';

// Use in validation
const isValidPhone = internationalPhoneNumber.test('+4712345678');
const isValidName = lettersSpaceAndHyphen.test('Jean-Pierre');
```

#### Available Patterns

- `internationalPhoneNumber` - International phone numbers in E.164 format
- `letters` - Unicode letters only
- `lettersAndSpace` - Unicode letters and spaces
- `lettersSpaceAndHyphen` - Unicode letters, spaces, and hyphens

### DateTime Utilities

Utilities for formatting dates and date ranges.

#### Usage Examples

```typescript
// Import specific utilities from @eventuras/core/datetime
import { formatDate, formatDateSpan } from '@eventuras/core/datetime';

// Format a single date
const formatted = formatDate(new Date(), { locale: 'en-US', showTime: true });

// Format a date range
const dateSpan = formatDateSpan('2025-01-01', '2025-01-31', { locale: 'nb-NO' });
```

#### Available Functions

- `formatDate(date, options?)` - Format a single date with locale and time options
- `formatDateSpan(startDate, endDate?, options?)` - Format a date range

## Development

```bash
# Build the library
pnpm build

# Watch mode for development
pnpm dev
```
