# Server Action Patterns

## Overview

This directory contains type definitions and patterns for consistent server action implementation across the application.

## ServerActionResult Pattern

### Why?

- **Consistent Error Handling**: All server actions return a standardized result type
- **Type-Safe**: TypeScript ensures you handle both success and error cases
- **User Feedback**: Makes it easy to show toast notifications for errors
- **Better Logging**: Structured error information for debugging
- **No Silent Failures**: Errors are explicit and must be handled

### Type Definition

```typescript
import { ServerActionResult, actionError, actionSuccess } from '@/types/serverAction';

// Success with data
type ServerActionSuccess<T> = {
  success: true;
  data: T;
  message?: string;
};

// Error
type ServerActionError = {
  success: false;
  error: {
    message: string;
    code?: string;
    details?: unknown;
  };
};

type ServerActionResult<T = void> = ServerActionSuccess<T> | ServerActionError;
```

### Server Action Example

```typescript
'use server';

import { Logger } from '@eventuras/logger';
import { actionError, type ServerActionResult } from '@/types/serverAction';

const logger = Logger.create({
  namespace: 'web:admin',
  context: { module: 'action:createEvent' }
});

export async function createEvent(
  formData: FormData
): Promise<ServerActionResult<{ eventId: number }>> {
  logger.info('Starting event creation');

  try {
    // Validate input
    const title = formData.get('title')?.toString()?.trim();
    if (!title) {
      logger.error({ title }, 'Event title is required');
      return actionError('Event title is required', 'INVALID_TITLE');
    }

    logger.info({ title }, 'Creating event');

    // Call API
    const result = await api.createEvent({ title });

    logger.info({ eventId: result.id }, 'Event created successfully');

    // For redirects, use Next.js redirect() which throws
    redirect(`/admin/events/${result.id}/edit`);

  } catch (error) {
    // Check if it's a Next.js redirect (expected behavior)
    if (error && typeof error === 'object' && 'digest' in error) {
      logger.info('Redirect initiated');
      throw error; // Re-throw to allow redirect
    }

    // Handle actual errors
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error({ error }, 'Failed to create event');
    
    return actionError(
      `Failed to create event: ${errorMessage}`,
      'CREATE_EVENT_FAILED',
      error
    );
  }
}
```

### Client Component Example

```typescript
'use client';

import { useState } from 'react';
import { Logger } from '@eventuras/logger';
import { useToast } from '@eventuras/toast';
import { useTranslations } from 'next-intl';

import { createEvent } from './actions';

const logger = Logger.create({
  namespace: 'web:admin',
  context: { component: 'CreateEventForm' }
});

export const CreateEventForm = () => {
  const t = useTranslations();
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (isSubmitting) return;
    setIsSubmitting(true);

    logger.info('Starting form submission');

    const formData = new FormData(event.currentTarget);

    try {
      const result = await createEvent(formData);
      
      // If result is returned (not redirected), handle it
      if (!result.success) {
        logger.error({ error: result.error }, 'Action failed');
        toast.error(result.error.message);
        setIsSubmitting(false);
      } else {
        logger.info({ data: result.data }, 'Action succeeded');
        toast.success(t('admin.createEvent.success'));
        // Note: redirect happens in server action
      }
    } catch (error) {
      // Next.js redirects throw - this is expected
      if (error && typeof error === 'object' && 'digest' in error) {
        logger.info('Redirect caught');
        throw error; // Re-throw to allow redirect
      }
      
      // Handle unexpected errors
      logger.error({ error }, 'Unexpected error');
      toast.error(t('admin.createEvent.error'));
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="title" required />
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? t('common.buttons.submitting') : t('common.buttons.submit')}
      </button>
    </form>
  );
};
```

## Best Practices

### 1. Always Log Key Steps

```typescript
logger.info('Starting action');
logger.info({ params }, 'Validated parameters');
logger.info({ result }, 'API call succeeded');
logger.error({ error }, 'Action failed');
```

### 2. Validate All Inputs

```typescript
const title = formData.get('title')?.toString()?.trim();
if (!title) {
  logger.error({ title }, 'Title required');
  return actionError('Title is required', 'INVALID_TITLE');
}
```

### 3. Use Error Codes

Error codes help with debugging and can be used for specific error handling:

```typescript
return actionError('Invalid organization ID', 'INVALID_ORG_ID', { orgId });
```

### 4. Handle Redirects Properly

Next.js redirects throw an error with a `digest` property. Always re-throw these:

```typescript
catch (error) {
  if (error && typeof error === 'object' && 'digest' in error) {
    throw error; // Allow redirect
  }
  return actionError('Failed', 'ERROR_CODE');
}
```

### 5. Show User Feedback

Always show toast notifications for errors:

```typescript
if (!result.success) {
  toast.error(result.error.message);
}
```

### 6. Prevent Double Submission

Use state to disable the submit button:

```typescript
const [isSubmitting, setIsSubmitting] = useState(false);

if (isSubmitting) return;
setIsSubmitting(true);
```

## Migration Guide

### Old Pattern (Don't Do This)

```typescript
// ❌ Old way - silent failures, no error handling
export async function createEvent(formData: FormData) {
  const title = formData.get('title')?.toString() ?? 'New event';
  
  try {
    const result = await api.create({ title });
    redirect(`/events/${result.id}`);
  } catch (error) {
    console.error(error); // User sees nothing!
    throw error;
  }
}
```

### New Pattern (Do This)

```typescript
// ✅ New way - explicit errors, user feedback, logging
export async function createEvent(
  formData: FormData
): Promise<ServerActionResult<{ eventId: number }>> {
  logger.info('Starting event creation');

  try {
    const title = formData.get('title')?.toString()?.trim();
    if (!title) {
      logger.error('Title required');
      return actionError('Title is required', 'INVALID_TITLE');
    }

    logger.info({ title }, 'Creating event');
    const result = await api.create({ title });
    
    logger.info({ eventId: result.id }, 'Event created');
    redirect(`/events/${result.id}`);
    
  } catch (error) {
    if (error && typeof error === 'object' && 'digest' in error) {
      throw error;
    }
    
    logger.error({ error }, 'Failed to create event');
    return actionError('Failed to create event', 'CREATE_FAILED');
  }
}
```

## Common Error Codes

- `INVALID_*` - Validation errors (e.g., `INVALID_TITLE`, `INVALID_ORG_ID`)
- `MISSING_*` - Required data missing (e.g., `MISSING_EVENT_ID`)
- `*_FAILED` - Operation failures (e.g., `CREATE_FAILED`, `UPDATE_FAILED`)
- `NO_DATA_RETURNED` - API returned unexpected empty response
- `UNAUTHORIZED` - Permission errors
- `NOT_FOUND` - Resource not found

## See Also

- [Logger Documentation](../../libs/logger/README.md)
- [Toast Documentation](../../libs/toast/README.md)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
