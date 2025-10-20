# @eventuras/core-nextjs

Core Next.js utilities for Eventuras applications.

## Features

### Server Action Utilities

Standardized types and helpers for Next.js server actions with proper success/error handling.

#### Usage

```typescript
'use server';

import { 
  ServerActionResult, 
  actionSuccess, 
  actionError 
} from '@eventuras/core-nextjs/actions';

export async function createEvent(
  formData: FormData
): Promise<ServerActionResult<{ eventId: number }>> {
  try {
    const event = await api.createEvent(...);
    return actionSuccess({ eventId: event.id }, 'Event created successfully!');
  } catch (error) {
    return actionError('Failed to create event', 'CREATE_FAILED');
  }
}
```

#### Client-side usage

```typescript
'use client';

import { useToast } from '@eventuras/toast';
import { createEvent } from './actions';

export function EventForm() {
  const toast = useToast();

  const handleSubmit = async (formData: FormData) => {
    const result = await createEvent(formData);
    
    if (result.success) {
      toast.success(result.message || 'Success!');
      // Access typed data
      console.log(result.data.eventId);
    } else {
      toast.error(result.error.message);
    }
  };

  return <form action={handleSubmit}>...</form>;
}
```

#### Available Types & Functions

- `ServerActionResult<T>` - Discriminated union for success/error
- `ServerActionSuccess<T>` - Success type with data
- `ServerActionError` - Error type with message, code, details
- `actionSuccess(data, message?)` - Helper to create success result
- `actionError(message, code?, details?)` - Helper to create error result

## Development

```bash
# Build the library
pnpm build

# Watch mode for development
pnpm dev
```
