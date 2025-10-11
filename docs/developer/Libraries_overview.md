# Libraries Overview

Eventuras provides a collection of reusable libraries that power the frontend applications. These libraries promote code reuse, maintainability, and consistency across the platform.

## Table of Contents

- [Core Libraries](#core-libraries)
- [UI Libraries](#ui-libraries)
- [Utility Libraries](#utility-libraries)
- [Using Libraries](#using-libraries)
- [Creating New Libraries](#creating-new-libraries)

## Core Libraries

### @eventuras/sdk

**Purpose:** TypeScript SDK for interacting with the Eventuras API

**Location:** `libs/sdk/`

**Key Features:**
- Type-safe API client
- Auto-generated from OpenAPI specification
- Request/response models
- Error handling utilities
- Authentication helpers

**Usage:**
```typescript
import { EventurasApi } from '@eventuras/sdk';

const api = new EventurasApi({
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
  getAccessToken: async () => {
    const session = await getSession();
    return session?.accessToken;
  },
});

// Fetch events
const events = await api.events.list({
  page: 1,
  limit: 20,
});

// Create registration
const registration = await api.registrations.create({
  eventId: 123,
  userId: 'user-id',
  products: [1, 2, 3],
});
```

**Documentation:** [libs/sdk/README.md](../../libs/sdk/README.md)

---

### @eventuras/event-sdk

**Purpose:** Event-specific SDK with business logic

**Location:** `libs/event-sdk/`

**Key Features:**
- Event management utilities
- Registration helpers
- Product selection logic
- Event state management

**Usage:**
```typescript
import { useEvent, useRegistration } from '@eventuras/event-sdk';

function EventRegistration({ eventId }: { eventId: number }) {
  const { event, loading } = useEvent(eventId);
  const { register, isRegistering } = useRegistration();

  const handleRegister = async () => {
    await register({
      eventId,
      products: selectedProducts,
    });
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <h1>{event.title}</h1>
      <Button onClick={handleRegister} disabled={isRegistering}>
        Register
      </Button>
    </div>
  );
}
```

**Documentation:** [libs/event-sdk/README.md](../../libs/event-sdk/README.md)

---

### @eventuras/fides-auth

**Purpose:** Authentication and authorization utilities

**Location:** `libs/fides-auth/`

**Key Features:**
- Auth0 integration helpers
- Token management
- Protected route components
- Permission checking utilities

**Usage:**
```typescript
import { withAuth, useAuth, hasRole } from '@eventuras/fides-auth';

// Protect a page
export default withAuth(function ProtectedPage() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return <div>Welcome, {user.name}!</div>;
});

// Check user role
function AdminPanel() {
  const { user } = useAuth();

  if (!hasRole(user, 'Admin')) {
    return <div>Access denied</div>;
  }

  return <AdminDashboard />;
}
```

**Documentation:** [libs/fides-auth/README.md](../../libs/fides-auth/README.md)

---

## UI Libraries

### @eventuras/ratio-ui

**Purpose:** Design system and reusable UI components

**Location:** `libs/ratio-ui/`

**Key Features:**
- React Aria Components foundation
- Tailwind CSS styling
- Accessible components
- Responsive design
- Dark mode support

**Components:**
- Buttons, Links, Icons
- Forms (Input, Select, Checkbox, Radio)
- Layout (Container, Section, Grid)
- Navigation (Navbar, Tabs, Breadcrumbs)
- Feedback (Alert, Toast, Modal)
- Data Display (Table, Card, Badge)

**Usage:**
```typescript
import { Button, Input, Form } from '@eventuras/ratio-ui';

function RegistrationForm() {
  return (
    <Form onSubmit={handleSubmit}>
      <Input
        label="Email"
        type="email"
        name="email"
        required
      />
      <Input
        label="Full Name"
        type="text"
        name="name"
        required
      />
      <Button type="submit" variant="primary">
        Register
      </Button>
    </Form>
  );
}
```

**Storybook:**
```bash
cd libs/ratio-ui
npm run storybook
```

**Documentation:** [libs/ratio-ui/README.md](../../libs/ratio-ui/README.md)

---

### @eventuras/smartform

**Purpose:** Intelligent form system with validation

**Location:** `libs/smartform/`

**Key Features:**
- Schema-based form generation
- Built-in validation (Zod)
- Multi-step forms
- Conditional fields
- File uploads
- Accessibility (ARIA labels, error announcements)

**Usage:**
```typescript
import { SmartForm, createFormSchema } from '@eventuras/smartform';
import { z } from 'zod';

const registrationSchema = createFormSchema({
  email: z.string().email(),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  phone: z.string().optional(),
  products: z.array(z.number()).min(1, 'Select at least one product'),
});

function RegistrationForm() {
  const handleSubmit = async (data) => {
    await api.registrations.create(data);
  };

  return (
    <SmartForm
      schema={registrationSchema}
      onSubmit={handleSubmit}
      submitLabel="Complete Registration"
    />
  );
}
```

**Documentation:** [libs/smartform/README.md](../../libs/smartform/README.md)

---

### @eventuras/datatable

**Purpose:** Data table component with sorting, filtering, and pagination

**Location:** `libs/datatable/`

**Key Features:**
- Server-side and client-side modes
- Sortable columns
- Filterable data
- Pagination
- Row selection
- Export to CSV/Excel
- Responsive design

**Usage:**
```typescript
import { DataTable } from '@eventuras/datatable';

function EventsList() {
  const columns = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'title', label: 'Event Title', sortable: true },
    { key: 'startDate', label: 'Start Date', sortable: true },
    { key: 'status', label: 'Status', filterable: true },
  ];

  return (
    <DataTable
      data={events}
      columns={columns}
      pagination
      pageSize={20}
      onRowClick={(event) => router.push(`/events/${event.id}`)}
    />
  );
}
```

---

### @eventuras/scribo

**Purpose:** Markdown editor component

**Location:** `libs/scribo/`

**Key Features:**
- Rich text editing with Markdown
- Preview mode
- Toolbar with formatting options
- Image upload
- Syntax highlighting for code blocks

**Usage:**
```typescript
import { MarkdownEditor } from '@eventuras/scribo';

function EventDescriptionEditor() {
  const [content, setContent] = useState('');

  return (
    <MarkdownEditor
      value={content}
      onChange={setContent}
      placeholder="Enter event description..."
      imageUpload={async (file) => {
        const url = await uploadImage(file);
        return url;
      }}
    />
  );
}
```

**Documentation:** [libs/scribo/README.md](../../libs/scribo/README.md)

---

### @eventuras/markdown

**Purpose:** Markdown processing and rendering

**Location:** `libs/markdown/`

**Key Features:**
- Markdown to HTML conversion
- Syntax highlighting
- Sanitization (XSS protection)
- Custom renderers
- Table of contents generation

**Usage:**
```typescript
import { MarkdownRenderer, parseMarkdown } from '@eventuras/markdown';

function EventDescription({ markdown }: { markdown: string }) {
  return (
    <div>
      <MarkdownRenderer content={markdown} />
    </div>
  );
}

// Or manual parsing
const html = parseMarkdown(markdown, {
  sanitize: true,
  syntaxHighlight: true,
});
```

**Documentation:** [libs/markdown/README.md](../../libs/markdown/README.md)

---

### @eventuras/markdowninput

**Purpose:** Simple markdown input component

**Location:** `libs/markdowninput/`

**Key Features:**
- Lightweight markdown input
- Basic formatting toolbar
- Preview toggle
- Auto-save support

**Usage:**
```typescript
import { MarkdownInput } from '@eventuras/markdowninput';

function CommentForm() {
  const [comment, setComment] = useState('');

  return (
    <MarkdownInput
      value={comment}
      onChange={setComment}
      placeholder="Add a comment..."
      maxLength={1000}
    />
  );
}
```

**Documentation:** [libs/markdowninput/README.md](../../libs/markdowninput/README.md)

---

## Utility Libraries

### @eventuras/utils

**Purpose:** Shared utility functions

**Location:** `libs/utils/`

**Key Features:**
- Date formatting
- String manipulation
- Number formatting
- Validation helpers
- Logging utilities
- Type guards

**Usage:**
```typescript
import {
  formatDate,
  formatCurrency,
  truncate,
  Logger,
} from '@eventuras/utils';

// Date formatting
formatDate(new Date(), 'long'); // "January 15, 2024"

// Currency formatting
formatCurrency(1234.56, 'USD'); // "$1,234.56"

// String truncation
truncate('Long text here...', 20); // "Long text here..."

// Logging
const logger = new Logger('MyComponent');
logger.info('User registered', { userId: 123 });
logger.error('Registration failed', error);
```

---

### @eventuras/toast

**Purpose:** Toast notification system

**Location:** `libs/toast/`

**Key Features:**
- Success, error, warning, info toasts
- Customizable duration
- Position configuration
- Action buttons
- Progress indicator

**Usage:**
```typescript
import { toast, ToastProvider } from '@eventuras/toast';

// In your app root
function App() {
  return (
    <ToastProvider position="top-right">
      <YourApp />
    </ToastProvider>
  );
}

// In your components
function RegistrationButton() {
  const handleRegister = async () => {
    try {
      await api.register();
      toast.success('Registration successful!');
    } catch (error) {
      toast.error('Registration failed', {
        description: error.message,
        action: {
          label: 'Retry',
          onClick: handleRegister,
        },
      });
    }
  };

  return <Button onClick={handleRegister}>Register</Button>;
}
```

**Documentation:** [libs/toast/README.md](../../libs/toast/README.md)

---

### @eventuras/eslint-config

**Purpose:** Shared ESLint configuration

**Location:** `libs/eslint-config/`

**Usage:**
```json
// .eslintrc.json
{
  "extends": "@eventuras/eslint-config"
}
```

---

### @eventuras/typescript-config

**Purpose:** Shared TypeScript configurations

**Location:** `libs/typescript-config/`

**Configurations:**
- `base.json` - Base config for all projects
- `nextjs.json` - Next.js specific config
- `library.json` - Library config

**Usage:**
```json
// tsconfig.json
{
  "extends": "@eventuras/typescript-config/nextjs.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

---

## Using Libraries

### Installation

Libraries are automatically available in the monorepo workspace:

```json
// package.json
{
  "dependencies": {
    "@eventuras/sdk": "*",
    "@eventuras/ratio-ui": "*",
    "@eventuras/smartform": "*"
  }
}
```

Then install:
```bash
npm install
```

### Importing

```typescript
// Named imports
import { Button, Input } from '@eventuras/ratio-ui';
import { useAuth } from '@eventuras/fides-auth';
import { formatDate } from '@eventuras/utils';

// Default imports
import { EventurasApi } from '@eventuras/sdk';
```

### TypeScript Support

All libraries include TypeScript definitions:

```typescript
import type { Event, Registration } from '@eventuras/sdk';

const event: Event = {
  id: 1,
  title: 'Conference 2024',
  // TypeScript provides autocomplete and type checking
};
```

### Tree Shaking

Libraries support tree shaking for optimal bundle size:

```typescript
// ✅ Only imports Button code
import { Button } from '@eventuras/ratio-ui';

// ❌ Imports entire library
import * as RatioUI from '@eventuras/ratio-ui';
```

## Creating New Libraries

### 1. Create Library Directory

```bash
mkdir -p libs/my-library/src
cd libs/my-library
```

### 2. Initialize Package

```bash
npm init -y
```

### 3. Configure package.json

```json
{
  "name": "@eventuras/my-library",
  "version": "0.0.1",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "scripts": {
    "build": "tsup src/index.ts --format esm --dts",
    "dev": "tsup src/index.ts --format esm --dts --watch",
    "lint": "eslint src/",
    "typecheck": "tsc --noEmit"
  },
  "devDependencies": {
    "@eventuras/eslint-config": "*",
    "@eventuras/typescript-config": "*",
    "tsup": "^8.0.0",
    "typescript": "^5.3.0"
  }
}
```

### 4. Create TypeScript Config

```json
// tsconfig.json
{
  "extends": "@eventuras/typescript-config/library.json",
  "include": ["src"],
  "exclude": ["dist", "node_modules"]
}
```

### 5. Write Your Library

```typescript
// src/index.ts
export function myUtility(input: string): string {
  return input.toUpperCase();
}

export type MyType = {
  id: number;
  name: string;
};
```

### 6. Add to Root package.json

```json
{
  "workspaces": [
    "apps/*",
    "libs/*",
    "libs/my-library"  // Add your library
  ]
}
```

### 7. Build and Use

```bash
# Build library
npm run build --workspace=libs/my-library

# Use in app
# In apps/web/package.json
{
  "dependencies": {
    "@eventuras/my-library": "*"
  }
}

# Import in app
import { myUtility } from '@eventuras/my-library';
```

### 8. Add Tests

```typescript
// src/index.test.ts
import { describe, it, expect } from 'vitest';
import { myUtility } from './index';

describe('myUtility', () => {
  it('should uppercase input', () => {
    expect(myUtility('hello')).toBe('HELLO');
  });
});
```

### 9. Add Documentation

Create `README.md`:

```markdown
# @eventuras/my-library

Description of your library.

## Installation

\`\`\`bash
npm install @eventuras/my-library
\`\`\`

## Usage

\`\`\`typescript
import { myUtility } from '@eventuras/my-library';

const result = myUtility('hello');
console.log(result); // "HELLO"
\`\`\`

## API

### myUtility(input: string): string

Converts input to uppercase.

**Parameters:**
- `input` - String to convert

**Returns:** Uppercased string
```

## Best Practices

### Library Design

1. **Single Responsibility** - Each library should have a clear, focused purpose
2. **Minimal Dependencies** - Keep dependencies to a minimum
3. **Tree Shakeable** - Export individual functions, not default objects
4. **Type Safety** - Always include TypeScript definitions
5. **Documentation** - Document all public APIs

### Versioning

```json
// Use semantic versioning
{
  "version": "1.0.0"  // MAJOR.MINOR.PATCH
}

// Breaking change: 2.0.0
// New feature: 1.1.0
// Bug fix: 1.0.1
```

### Publishing (Internal Use)

For internal monorepo use, libraries don't need to be published to npm. They're linked via workspaces.

For external use:
```bash
# Publish to npm
npm publish --workspace=libs/my-library
```

## Further Reading

- [Creating Libraries Documentation](https://turbo.build/repo/docs/handbook/sharing-code)
- [TypeScript Library Best Practices](https://www.typescriptlang.org/docs/handbook/declaration-files/library-structures.html)
- [npm Workspaces](https://docs.npmjs.com/cli/v10/using-npm/workspaces)
