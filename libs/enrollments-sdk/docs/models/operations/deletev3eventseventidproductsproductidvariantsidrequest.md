# DeleteV3EventsEventIdProductsProductIdVariantsIdRequest

## Example Usage

```typescript
import { DeleteV3EventsEventIdProductsProductIdVariantsIdRequest } from "enrollments-sdk/models/operations";

let value: DeleteV3EventsEventIdProductsProductIdVariantsIdRequest = {
  eventId: 639921,
  productId: 143353,
  id: 944669,
};
```

## Fields

| Field                                                        | Type                                                         | Required                                                     | Description                                                  |
| ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| `eventId`                                                    | *number*                                                     | :heavy_check_mark:                                           | N/A                                                          |
| `productId`                                                  | *number*                                                     | :heavy_check_mark:                                           | N/A                                                          |
| `id`                                                         | *number*                                                     | :heavy_check_mark:                                           | N/A                                                          |
| `eventurasOrgId`                                             | *number*                                                     | :heavy_minus_sign:                                           | Optional organization Id. Will be required in API version 4. |