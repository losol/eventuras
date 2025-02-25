# GetV3UsersRequest

## Example Usage

```typescript
import { GetV3UsersRequest } from "eventuras-sdk-v2/models/operations";

let value: GetV3UsersRequest = {};
```

## Fields

| Field                                                                | Type                                                                 | Required                                                             | Description                                                          |
| -------------------------------------------------------------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `query`                                                              | *string*                                                             | :heavy_minus_sign:                                                   | N/A                                                                  |
| `organizationId`                                                     | *number*                                                             | :heavy_minus_sign:                                                   | N/A                                                                  |
| `includeOrgMembership`                                               | *boolean*                                                            | :heavy_minus_sign:                                                   | N/A                                                                  |
| `order`                                                              | [components.UserListOrder](../../models/components/userlistorder.md) | :heavy_minus_sign:                                                   | N/A                                                                  |
| `descending`                                                         | *boolean*                                                            | :heavy_minus_sign:                                                   | N/A                                                                  |
| `page`                                                               | *number*                                                             | :heavy_minus_sign:                                                   | N/A                                                                  |
| `count`                                                              | *number*                                                             | :heavy_minus_sign:                                                   | N/A                                                                  |
| `limit`                                                              | *number*                                                             | :heavy_minus_sign:                                                   | N/A                                                                  |
| `offset`                                                             | *number*                                                             | :heavy_minus_sign:                                                   | N/A                                                                  |
| `ordering`                                                           | *string*[]                                                           | :heavy_minus_sign:                                                   | N/A                                                                  |
| `eventurasOrgId`                                                     | *number*                                                             | :heavy_minus_sign:                                                   | Optional organization Id. Will be required in API version 4.         |