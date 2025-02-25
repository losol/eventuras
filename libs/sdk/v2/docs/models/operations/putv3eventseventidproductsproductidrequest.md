# PutV3EventsEventIdProductsProductIdRequest

## Example Usage

```typescript
import { PutV3EventsEventIdProductsProductIdRequest } from "eventuras-sdk-v2/models/operations";

let value: PutV3EventsEventIdProductsProductIdRequest = {
  eventId: 832620,
  productId: 778157,
};
```

## Fields

| Field                                                                  | Type                                                                   | Required                                                               | Description                                                            |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------- | ---------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `eventId`                                                              | *number*                                                               | :heavy_check_mark:                                                     | N/A                                                                    |
| `productId`                                                            | *number*                                                               | :heavy_check_mark:                                                     | N/A                                                                    |
| `eventurasOrgId`                                                       | *number*                                                               | :heavy_minus_sign:                                                     | Optional organization Id. Will be required in API version 4.           |
| `productFormDto`                                                       | [components.ProductFormDto](../../models/components/productformdto.md) | :heavy_minus_sign:                                                     | N/A                                                                    |