# PostV3EventsEventIdProductsProductIdVariantsRequest

## Example Usage

```typescript
import { PostV3EventsEventIdProductsProductIdVariantsRequest } from "enrollments-sdk/models/operations";

let value: PostV3EventsEventIdProductsProductIdVariantsRequest = {
  eventId: 780529,
  productId: 118274,
};
```

## Fields

| Field                                                                              | Type                                                                               | Required                                                                           | Description                                                                        |
| ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `eventId`                                                                          | *number*                                                                           | :heavy_check_mark:                                                                 | N/A                                                                                |
| `productId`                                                                        | *number*                                                                           | :heavy_check_mark:                                                                 | N/A                                                                                |
| `eventurasOrgId`                                                                   | *number*                                                                           | :heavy_minus_sign:                                                                 | Optional organization Id. Will be required in API version 4.                       |
| `newProductVariantDto`                                                             | [components.NewProductVariantDto](../../models/components/newproductvariantdto.md) | :heavy_minus_sign:                                                                 | N/A                                                                                |