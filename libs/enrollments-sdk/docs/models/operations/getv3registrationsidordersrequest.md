# GetV3RegistrationsIdOrdersRequest

## Example Usage

```typescript
import { GetV3RegistrationsIdOrdersRequest } from "enrollments-sdk/models/operations";

let value: GetV3RegistrationsIdOrdersRequest = {
  id: 208876,
};
```

## Fields

| Field                                                        | Type                                                         | Required                                                     | Description                                                  |
| ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| `id`                                                         | *number*                                                     | :heavy_check_mark:                                           | N/A                                                          |
| `eventurasOrgId`                                             | *number*                                                     | :heavy_minus_sign:                                           | Optional organization Id. Will be required in API version 4. |