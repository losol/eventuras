# PatchV3OrdersIdRequest

## Example Usage

```typescript
import { PatchV3OrdersIdRequest } from "eventuras-sdk-v2/models/operations";

let value: PatchV3OrdersIdRequest = {
  id: 943749,
};
```

## Fields

| Field                                                        | Type                                                         | Required                                                     | Description                                                  |
| ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| `id`                                                         | *number*                                                     | :heavy_check_mark:                                           | N/A                                                          |
| `eventurasOrgId`                                             | *number*                                                     | :heavy_minus_sign:                                           | Optional organization Id. Will be required in API version 4. |