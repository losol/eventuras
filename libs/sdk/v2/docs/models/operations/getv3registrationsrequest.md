# GetV3RegistrationsRequest

## Example Usage

```typescript
import { GetV3RegistrationsRequest } from "eventuras-sdk-v2/models/operations";

let value: GetV3RegistrationsRequest = {};
```

## Fields

| Field                                                        | Type                                                         | Required                                                     | Description                                                  |
| ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| `eventId`                                                    | *number*                                                     | :heavy_minus_sign:                                           | N/A                                                          |
| `userId`                                                     | *string*                                                     | :heavy_minus_sign:                                           | N/A                                                          |
| `includeEventInfo`                                           | *boolean*                                                    | :heavy_minus_sign:                                           | N/A                                                          |
| `includeUserInfo`                                            | *boolean*                                                    | :heavy_minus_sign:                                           | N/A                                                          |
| `includeProducts`                                            | *boolean*                                                    | :heavy_minus_sign:                                           | N/A                                                          |
| `includeOrders`                                              | *boolean*                                                    | :heavy_minus_sign:                                           | N/A                                                          |
| `page`                                                       | *number*                                                     | :heavy_minus_sign:                                           | N/A                                                          |
| `count`                                                      | *number*                                                     | :heavy_minus_sign:                                           | N/A                                                          |
| `limit`                                                      | *number*                                                     | :heavy_minus_sign:                                           | N/A                                                          |
| `offset`                                                     | *number*                                                     | :heavy_minus_sign:                                           | N/A                                                          |
| `ordering`                                                   | *string*[]                                                   | :heavy_minus_sign:                                           | N/A                                                          |
| `eventurasOrgId`                                             | *number*                                                     | :heavy_minus_sign:                                           | Optional organization Id. Will be required in API version 4. |