# GetV3OrdersIdRequest

## Example Usage

```typescript
import { GetV3OrdersIdRequest } from "enrollments-sdk/models/operations";

let value: GetV3OrdersIdRequest = {
  id: 616934,
};
```

## Fields

| Field                                                        | Type                                                         | Required                                                     | Description                                                  |
| ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| `id`                                                         | *number*                                                     | :heavy_check_mark:                                           | N/A                                                          |
| `includeUser`                                                | *boolean*                                                    | :heavy_minus_sign:                                           | N/A                                                          |
| `includeRegistration`                                        | *boolean*                                                    | :heavy_minus_sign:                                           | N/A                                                          |
| `eventurasOrgId`                                             | *number*                                                     | :heavy_minus_sign:                                           | Optional organization Id. Will be required in API version 4. |