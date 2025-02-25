# GetV3NotificationsIdRequest

## Example Usage

```typescript
import { GetV3NotificationsIdRequest } from "enrollments-sdk/models/operations";

let value: GetV3NotificationsIdRequest = {
  id: 617636,
};
```

## Fields

| Field                                                        | Type                                                         | Required                                                     | Description                                                  |
| ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| `id`                                                         | *number*                                                     | :heavy_check_mark:                                           | N/A                                                          |
| `includeStatistics`                                          | *boolean*                                                    | :heavy_minus_sign:                                           | N/A                                                          |
| `eventurasOrgId`                                             | *number*                                                     | :heavy_minus_sign:                                           | Optional organization Id. Will be required in API version 4. |