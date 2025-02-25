# ProductDto

## Example Usage

```typescript
import { ProductDto } from "eventuras-sdk-v2/models/components";

let value: ProductDto = {};
```

## Fields

| Field                                                                          | Type                                                                           | Required                                                                       | Description                                                                    |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| `productId`                                                                    | *number*                                                                       | :heavy_minus_sign:                                                             | N/A                                                                            |
| `name`                                                                         | *string*                                                                       | :heavy_minus_sign:                                                             | N/A                                                                            |
| `description`                                                                  | *string*                                                                       | :heavy_minus_sign:                                                             | N/A                                                                            |
| `price`                                                                        | *number*                                                                       | :heavy_minus_sign:                                                             | N/A                                                                            |
| `vatPercent`                                                                   | *number*                                                                       | :heavy_minus_sign:                                                             | N/A                                                                            |
| `visibility`                                                                   | [components.ProductVisibility](../../models/components/productvisibility.md)   | :heavy_minus_sign:                                                             | N/A                                                                            |
| `inventory`                                                                    | *number*                                                                       | :heavy_minus_sign:                                                             | N/A                                                                            |
| `published`                                                                    | *boolean*                                                                      | :heavy_minus_sign:                                                             | N/A                                                                            |
| `variants`                                                                     | [components.ProductVariantDto](../../models/components/productvariantdto.md)[] | :heavy_minus_sign:                                                             | N/A                                                                            |
| `minimumQuantity`                                                              | *number*                                                                       | :heavy_minus_sign:                                                             | N/A                                                                            |
| `isMandatory`                                                                  | *boolean*                                                                      | :heavy_minus_sign:                                                             | N/A                                                                            |
| `enableQuantity`                                                               | *boolean*                                                                      | :heavy_minus_sign:                                                             | N/A                                                                            |