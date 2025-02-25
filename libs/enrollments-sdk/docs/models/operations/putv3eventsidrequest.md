# PutV3EventsIdRequest

## Example Usage

```typescript
import { PutV3EventsIdRequest } from "enrollments-sdk/models/operations";

let value: PutV3EventsIdRequest = {
  id: 414662,
};
```

## Fields

| Field                                                              | Type                                                               | Required                                                           | Description                                                        |
| ------------------------------------------------------------------ | ------------------------------------------------------------------ | ------------------------------------------------------------------ | ------------------------------------------------------------------ |
| `id`                                                               | *number*                                                           | :heavy_check_mark:                                                 | The ID of the event.                                               |
| `eventurasOrgId`                                                   | *number*                                                           | :heavy_minus_sign:                                                 | Optional organization Id. Will be required in API version 4.       |
| `eventFormDto`                                                     | [components.EventFormDto](../../models/components/eventformdto.md) | :heavy_minus_sign:                                                 | Updated event information.                                         |