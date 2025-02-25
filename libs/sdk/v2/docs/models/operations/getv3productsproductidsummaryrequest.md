# GetV3ProductsProductIdSummaryRequest

## Example Usage

```typescript
import { GetV3ProductsProductIdSummaryRequest } from "eventuras-sdk-v2/models/operations";

let value: GetV3ProductsProductIdSummaryRequest = {
  productId: 988374,
};
```

## Fields

| Field                                                        | Type                                                         | Required                                                     | Description                                                  |
| ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| `productId`                                                  | *number*                                                     | :heavy_check_mark:                                           | N/A                                                          |
| `eventurasOrgId`                                             | *number*                                                     | :heavy_minus_sign:                                           | Optional organization Id. Will be required in API version 4. |