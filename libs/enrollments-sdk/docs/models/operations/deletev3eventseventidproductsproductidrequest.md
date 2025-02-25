# DeleteV3EventsEventIdProductsProductIdRequest

## Example Usage

```typescript
import { DeleteV3EventsEventIdProductsProductIdRequest } from "enrollments-sdk/models/operations";

let value: DeleteV3EventsEventIdProductsProductIdRequest = {
  eventId: 870013,
  productId: 978619,
};
```

## Fields

| Field                                                        | Type                                                         | Required                                                     | Description                                                  |
| ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| `eventId`                                                    | *number*                                                     | :heavy_check_mark:                                           | N/A                                                          |
| `productId`                                                  | *number*                                                     | :heavy_check_mark:                                           | N/A                                                          |
| `eventurasOrgId`                                             | *number*                                                     | :heavy_minus_sign:                                           | Optional organization Id. Will be required in API version 4. |