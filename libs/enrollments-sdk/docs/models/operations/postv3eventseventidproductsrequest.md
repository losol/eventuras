# PostV3EventsEventIdProductsRequest

## Example Usage

```typescript
import { PostV3EventsEventIdProductsRequest } from "enrollments-sdk/models/operations";

let value: PostV3EventsEventIdProductsRequest = {
  eventId: 20218,
};
```

## Fields

| Field                                                                | Type                                                                 | Required                                                             | Description                                                          |
| -------------------------------------------------------------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `eventId`                                                            | *number*                                                             | :heavy_check_mark:                                                   | N/A                                                                  |
| `eventurasOrgId`                                                     | *number*                                                             | :heavy_minus_sign:                                                   | Optional organization Id. Will be required in API version 4.         |
| `newProductDto`                                                      | [components.NewProductDto](../../models/components/newproductdto.md) | :heavy_minus_sign:                                                   | N/A                                                                  |