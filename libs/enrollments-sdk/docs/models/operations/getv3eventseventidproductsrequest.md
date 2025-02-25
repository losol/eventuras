# GetV3EventsEventIdProductsRequest

## Example Usage

```typescript
import { GetV3EventsEventIdProductsRequest } from "enrollments-sdk/models/operations";

let value: GetV3EventsEventIdProductsRequest = {
  eventId: 87129,
};
```

## Fields

| Field                                                                        | Type                                                                         | Required                                                                     | Description                                                                  |
| ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `eventId`                                                                    | *number*                                                                     | :heavy_check_mark:                                                           | N/A                                                                          |
| `visibility`                                                                 | [components.ProductVisibility](../../models/components/productvisibility.md) | :heavy_minus_sign:                                                           | N/A                                                                          |
| `eventurasOrgId`                                                             | *number*                                                                     | :heavy_minus_sign:                                                           | Optional organization Id. Will be required in API version 4.                 |