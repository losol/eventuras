# AGENTS.md

This file provides context and instructions for AI coding agents working on the Eventuras project [[5]](https://agents.md/).

## Project Overview

**Eventuras** is a comprehensive platform for managing courses, events, and conferences. It's built as a monorepo with specialized applications and shared libraries.

## Architecture

### Core Applications

1. **Backend API** (`apps/api`)
   - Language: C# .NET
   - Framework: ASP.NET Core
   - Database: PostgreSQL with Entity Framework Core
   - Purpose: RESTful API for course, event, and conference management

2. **Web Frontend** (`apps/web`)
   - Language: TypeScript
   - Framework: React 19+, Next.js 15+
   - Purpose: UI for participants and organizers

3. **Historia CMS** (`apps/historia`)
   - Language: TypeScript
   - Framework: React, Next.js
   - Purpose: Knowledge management system (in development)

4. **Converto API** (`apps/convertoapi`)
   - Language: TypeScript, Node.js
   - Framework: Fastify → Express.js (planned)
   - Purpose: HTML-to-PDF conversion microservice

5. **Shared Libraries** (`libs/`)
   - Language: TypeScript
   - Purpose: Reusable frontend components, utilities, and SDKs

## Agent Instructions

This project uses specialized agents for different contexts:

### Backend Agent

- **Scope**: `apps/api/`
- **File**: `.ai/agents/backend-agent.md`
- **Tech**: C# .NET, ASP.NET Core, Entity Framework Core, PostgreSQL
- **Focus**: API development, business logic, database migrations, external integrations

### Frontend Agent

- **Scope**: `apps/web/`, `apps/historia/`, `libs/`, `apps/web-e2e/`
- **File**: `.ai/agents/frontend-agent.md`
- **Tech**: TypeScript, React, Next.js, Tailwind CSS, Playwright
- **Focus**: UI development, shared libraries, E2E testing, refactoring to libs

### Converto Agent

- **Scope**: `apps/convertoapi/`
- **File**: `.ai/agents/converto-agent.md`
- **Tech**: TypeScript, Node.js, Fastify/Express, Playwright
- **Focus**: PDF generation, microservice architecture, API design

## Path-Specific Instructions

For detailed coding guidelines that automatically apply when working on specific file types, see:

- **Playwright tests**: `.github/instructions/playwright-tests.instructions.md`
  - Applies to: `**/playwright-e2e/**/*.spec.ts`
  - Covers: Test structure, locators, assertions, authentication, and best practices

- **UI components**: `.github/instructions/ui-components.instructions.md`
  - Applies to: `libs/ratio-ui/**/*.{ts,tsx}`
  - Covers: Component patterns, styling, accessibility, TypeScript, and Storybook

- **Backend services**: `.github/instructions/backend-services.instructions.md`
  - Applies to: `apps/api/src/**/*.cs`
  - Covers: Architecture, async/await, DI, controllers, services, testing, and documentation

## Logging Preferences

### Use `@eventuras/logger` Instead of `console.log`

Always use the structured logger from `@eventuras/logger` instead of `console.log` for better observability and debugging.

```typescript
import { Logger } from "@eventuras/logger";

// Create a logger instance with namespace and context
const logger = Logger.create({
  namespace: "web:admin:collections",
  context: { module: "CollectionEditor" },
});
```

### Logging Guidelines

**For Happy Path (Success Cases):**

- Use **concise info logging** - log only key events
- Focus on business-relevant information
- Example:

  ```typescript
  logger.info({ collectionId: data.id }, "Collection updated successfully");
  ```

**For Error Cases:**

- Use **extensive logging** - include full context
- Log the error object, relevant IDs, input data, and stack traces
- Example:

  ```typescript
  logger.error(
    {
      error,
      collectionId: data.id,
      input: data,
    },
    "Failed to update collection",
  );
  ```

**Logging Levels:**

- `logger.debug()` - Development/debugging information (only in non-production)
- `logger.info()` - Normal operations, key business events
- `logger.warn()` - Recoverable issues, deprecations
- `logger.error()` - Errors that need attention

**Example Pattern:**

```typescript
export async function updateCollection(data: EventCollectionDto) {
  logger.info({ collectionId: data.id }, "Updating collection...");

  try {
    const response = await putV3EventcollectionsById({
      path: { id: data.id },
      body: data,
    });

    if (!response.data) {
      logger.error(
        {
          error: response.error,
          collectionId: data.id,
          requestBody: data,
        },
        "Failed to update collection",
      );
      return actionError("Failed to update collection");
    }

    logger.info({ collectionId: data.id }, "Collection updated successfully");
    return actionSuccess(undefined, "Collection successfully updated!");
  } catch (error) {
    logger.error(
      { error, collectionId: data.id },
      "Unexpected error updating collection",
    );
    return actionError("An unexpected error occurred");
  }
}
```

## User Feedback with Toast Notifications

### Use `@eventuras/toast` for User Feedback

Always provide user feedback for actions using the toast notification system from `@eventuras/toast`.

```typescript
import { useToast } from "@eventuras/toast";

const Component = () => {
  const toast = useToast();

  // Use toast for user feedback
  toast.success("Operation completed successfully!");
  toast.error("Something went wrong");
  toast.info("Here is some information");
  toast.warn("Warning: Check this out");
};
```

### Toast Usage Guidelines

**When to Use Toast Notifications:**

- After successful mutations (create, update, delete operations)
- When operations fail and user needs to know
- For important warnings or information that requires user attention
- To confirm actions have been processed

**Best Practices:**

- **Success messages**: Be concise and confirmatory
  - ✅ "Collection created!"
  - ✅ "Product updated successfully!"
  - ❌ "The collection has been successfully created and saved to the database"

- **Error messages**: Be helpful and actionable when possible
  - ✅ "Failed to create product. Please try again."
  - ✅ "Unable to save changes. Check your connection."
  - ❌ "Error"

- **Timing**: Show toasts immediately after the action completes
- **Consistency**: Use the same tone and style across the application

**Example Pattern in Server Actions:**

```typescript
'use client';

import { useToast } from '@eventuras/toast';
import { createProduct } from './actions';

export function ProductForm() {
  const toast = useToast();

  const handleSubmit = async (data: ProductDto) => {
    const result = await createProduct(eventId, data);

    if (!result.success) {
      toast.error(result.error.message);
      return;
    }

    // Server action can provide the message
    toast.success(result.message || 'Product created!');
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

## Server Actions Pattern

### Use `ServerActionResult` for Consistent Server Actions

Always use the standardized `ServerActionResult` type from `@eventuras/core-nextjs/actions` for server actions that perform mutations or data fetching that can fail.

**Import the utilities:**

```typescript
"use server";

import {
  actionError,
  actionSuccess,
  ServerActionResult,
} from "@eventuras/core-nextjs/actions";
```

**Server Action Pattern:**

```typescript
"use server";

import { Logger } from "@eventuras/logger";
import {
  actionError,
  actionSuccess,
  ServerActionResult,
} from "@eventuras/core-nextjs/actions";

const logger = Logger.create({
  namespace: "web:admin:events",
  context: { module: "excelExportActions" },
});

/**
 * Server action to download registrations as Excel file
 * @param eventId - The event ID to download registrations for
 * @returns Excel file as base64-encoded string or error
 */
export async function downloadRegistrationsExcel(
  eventId: number,
): Promise<ServerActionResult<string>> {
  try {
    logger.info({ eventId }, "Downloading registrations Excel file");

    // Perform authentication check
    const token = await getAccessToken();
    if (!token) {
      logger.error({ eventId }, "No access token available");
      return actionError("Authentication required");
    }

    // Make API call
    const response = await fetch(`${apiUrl}/registrations?EventId=${eventId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      logger.error(
        { eventId, status: response.status },
        "Failed to download file",
      );
      return actionError(`Failed to download: ${response.status}`);
    }

    const data = await response.text();
    logger.info({ eventId }, "File downloaded successfully");

    return actionSuccess(data);
  } catch (error) {
    logger.error({ error, eventId }, "Error downloading file");
    return actionError(
      error instanceof Error ? error.message : "Unknown error occurred",
    );
  }
}
```

**Client Component Pattern:**

```typescript
'use client';

import { useToast } from '@eventuras/toast';
import { downloadRegistrationsExcel } from './excelExportActions';

export function ExcelExportButton({ eventId }: { eventId: number }) {
  const toast = useToast();

  const handleDownload = async () => {
    const result = await downloadRegistrationsExcel(eventId);

    if (!result.success) {
      // result.error is typed as { message: string; code?: string; details?: unknown }
      toast.error(result.error.message);
      return;
    }

    // result.data is typed correctly based on ServerActionResult<string>
    const data = result.data;
    toast.success('Downloaded successfully!');
  };

  return <button onClick={handleDownload}>Download Excel</button>;
}
```

**Benefits:**

- **Type Safety**: Discriminated union provides proper TypeScript narrowing
- **Consistency**: All server actions follow the same pattern
- **Error Handling**: Structured error format with message, code, and details
- **Optional Messages**: Success actions can include user-friendly messages

**Return Type Guidelines:**

- Use `ServerActionResult<T>` where `T` is the success data type
- Use `ServerActionResult<void>` for actions that don't return data
- Use `actionSuccess(data, message?)` for success cases
- Use `actionError(message, code?, details?)` for error cases

## UI Component Development Workflow

### Component Creation Process

When creating new UI components in `libs/ratio-ui`:

1. **Create the component first** - Focus on implementing the component functionality and structure
2. **Ask about Storybook stories** - After the component is complete and working, ask if the user would like Storybook stories created for documentation and testing

**Example workflow:**

```typescript
// 1. Create the component
export function MyComponent({ children, ...props }) {
  return <div {...props}>{children}</div>;
}

// 2. After completion, agent asks:
// "Would you like me to create Storybook stories for this component?"
```

**Benefits:**

- Faster iteration on component functionality
- Stories are created with full knowledge of the final component API
- User can decide if documentation is needed at that moment
- Avoids premature documentation for components that might change

### Link Component Preference

**Always prefer using `Link` from `@eventuras/ratio-ui-next` instead of Next.js Link.**

**Example usage:**

```typescript
import { Link } from '@eventuras/ratio-ui-next';

// Basic link
<Link href="/admin">Go to Admin</Link>

// Link styled as a button
<Link href="/events" variant="button-primary">
  View Events
</Link>

// Other variants available
<Link href="/home" variant="button-primary">Home</Link>
<Link href="/docs" variant="button-outline">Documentation</Link>
```

**Creating New Variants:**

When existing variants don't meet design requirements, create new variants in the Link component rather than adding custom styling. This maintains consistency and reusability.

```typescript
// In ratio-ui-next/Link component
const variants = {
  "button-primary": "...",
  "button-secondary": "...",
  "button-danger": "...", // New variant
};
```

**When to use native Next.js Link:**

- Only in exceptional cases (e.g., global-error.tsx where ratio-ui might not be available)
- Should be explicitly documented with a comment explaining why

## Development Environment Tips

### Monorepo Navigation
