# PostV3EventsRequest

## Example Usage

```typescript
import { PostV3EventsRequest } from "enrollments-sdk/models/operations";

let value: PostV3EventsRequest = {};
```

## Fields

| Field                                                              | Type                                                               | Required                                                           | Description                                                        |
| ------------------------------------------------------------------ | ------------------------------------------------------------------ | ------------------------------------------------------------------ | ------------------------------------------------------------------ |
| `eventurasOrgId`                                                   | *number*                                                           | :heavy_minus_sign:                                                 | Optional organization Id. Will be required in API version 4.       |
| `eventFormDto`                                                     | [components.EventFormDto](../../models/components/eventformdto.md) | :heavy_minus_sign:                                                 | Event information.                                                 |