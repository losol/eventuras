# GetV3OrdersRequest

## Example Usage

```typescript
import { GetV3OrdersRequest } from "eventuras-sdk-v2/models/operations";

let value: GetV3OrdersRequest = {};
```

## Fields

| Field                                                            | Type                                                             | Required                                                         | Description                                                      |
| ---------------------------------------------------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------- |
| `userId`                                                         | *string*                                                         | :heavy_minus_sign:                                               | N/A                                                              |
| `eventId`                                                        | *number*                                                         | :heavy_minus_sign:                                               | N/A                                                              |
| `registrationId`                                                 | *number*                                                         | :heavy_minus_sign:                                               | N/A                                                              |
| `status`                                                         | [components.OrderStatus](../../models/components/orderstatus.md) | :heavy_minus_sign:                                               | N/A                                                              |
| `includeUser`                                                    | *boolean*                                                        | :heavy_minus_sign:                                               | N/A                                                              |
| `includeRegistration`                                            | *boolean*                                                        | :heavy_minus_sign:                                               | N/A                                                              |
| `organizationId`                                                 | *number*                                                         | :heavy_minus_sign:                                               | N/A                                                              |
| `page`                                                           | *number*                                                         | :heavy_minus_sign:                                               | N/A                                                              |
| `count`                                                          | *number*                                                         | :heavy_minus_sign:                                               | N/A                                                              |
| `limit`                                                          | *number*                                                         | :heavy_minus_sign:                                               | N/A                                                              |
| `offset`                                                         | *number*                                                         | :heavy_minus_sign:                                               | N/A                                                              |
| `ordering`                                                       | *string*[]                                                       | :heavy_minus_sign:                                               | N/A                                                              |
| `eventurasOrgId`                                                 | *number*                                                         | :heavy_minus_sign:                                               | Optional organization Id. Will be required in API version 4.     |