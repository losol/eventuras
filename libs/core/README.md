# @eventuras/core

Core utilities for Eventuras applications.

## Features

### Regex Patterns

Common validation regex patterns for form validation and data processing.

#### Usage

```typescript
// Import all regex patterns
import { regex } from '@eventuras/core';

// Or import specific patterns
import { internationalPhoneNumber, lettersSpaceAndHyphen } from '@eventuras/core/regex';

// Use in validation
const isValidPhone = regex.internationalPhoneNumber.test('+4712345678');
const isValidName = regex.lettersSpaceAndHyphen.test('Jean-Pierre');
```

#### Available Patterns

- `internationalPhoneNumber` - International phone numbers in E.164 format
- `letters` - Unicode letters only
- `lettersAndSpace` - Unicode letters and spaces
- `lettersSpaceAndHyphen` - Unicode letters, spaces, and hyphens

## Development

```bash
# Build the library
pnpm build

# Watch mode for development
pnpm dev
```
