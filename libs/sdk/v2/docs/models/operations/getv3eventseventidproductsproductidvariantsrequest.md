# GetV3EventsEventIdProductsProductIdVariantsRequest

## Example Usage

```typescript
import { GetV3EventsEventIdProductsProductIdVariantsRequest } from "eventuras-sdk-v2/models/operations";

let value: GetV3EventsEventIdProductsProductIdVariantsRequest = {
  eventId: 799159,
  productId: 461479,
};
```

## Fields

| Field                                                        | Type                                                         | Required                                                     | Description                                                  |
| ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| `eventId`                                                    | *number*                                                     | :heavy_check_mark:                                           | N/A                                                          |
| `productId`                                                  | *number*                                                     | :heavy_check_mark:                                           | N/A                                                          |
| `eventurasOrgId`                                             | *number*                                                     | :heavy_minus_sign:                                           | Optional organization Id. Will be required in API version 4. |