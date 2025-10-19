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

## Logging Preferences

### Use `@eventuras/logger` Instead of `console.log`

Always use the structured logger from `@eventuras/logger` instead of `console.log` for better observability and debugging.

```typescript
import { Logger } from '@eventuras/logger';

// Create a logger instance with namespace and context
const logger = Logger.create({ 
  namespace: 'web:admin:collections', 
  context: { module: 'CollectionEditor' } 
});
```

### Logging Guidelines

**For Happy Path (Success Cases):**

- Use **concise info logging** - log only key events
- Focus on business-relevant information
- Example:

  ```typescript
  logger.info({ collectionId: data.id }, 'Collection updated successfully');
  ```

**For Error Cases:**

- Use **extensive logging** - include full context
- Log the error object, relevant IDs, input data, and stack traces
- Example:

  ```typescript
  logger.error({ 
    error, 
    collectionId: data.id,
    input: data 
  }, 'Failed to update collection');
  ```

**Logging Levels:**

- `logger.debug()` - Development/debugging information (only in non-production)
- `logger.info()` - Normal operations, key business events
- `logger.warn()` - Recoverable issues, deprecations
- `logger.error()` - Errors that need attention

**Example Pattern:**

```typescript
export async function updateCollection(data: EventCollectionDto) {
  logger.info({ collectionId: data.id }, 'Updating collection...');

  try {
    const response = await putV3EventcollectionsById({
      path: { id: data.id },
      body: data,
    });

    if (!response.data) {
      logger.error({ 
        error: response.error,
        collectionId: data.id,
        requestBody: data 
      }, 'Failed to update collection');
      return actionError('Failed to update collection');
    }

    logger.info({ collectionId: data.id }, 'Collection updated successfully');
    return actionSuccess(undefined, 'Collection successfully updated!');
  } catch (error) {
    logger.error({ error, collectionId: data.id }, 'Unexpected error updating collection');
    return actionError('An unexpected error occurred');
  }
}
```

## User Feedback with Toast Notifications

### Use `@eventuras/toast` for User Feedback

Always provide user feedback for actions using the toast notification system from `@eventuras/toast`.

```typescript
import { useToast } from '@eventuras/toast';

const Component = () => {
  const toast = useToast();

  // Use toast for user feedback
  toast.success('Operation completed successfully!');
  toast.error('Something went wrong');
  toast.info('Here is some information');
  toast.warn('Warning: Check this out');
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

## Development Environment Tips

### Monorepo Navigation
