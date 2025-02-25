# PatchV3RegistrationsIdRequest

## Example Usage

```typescript
import { PatchV3RegistrationsIdRequest } from "enrollments-sdk/models/operations";

let value: PatchV3RegistrationsIdRequest = {
  id: 244425,
};
```

## Fields

| Field                                                        | Type                                                         | Required                                                     | Description                                                  |
| ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| `id`                                                         | *number*                                                     | :heavy_check_mark:                                           | N/A                                                          |
| `eventurasOrgId`                                             | *number*                                                     | :heavy_minus_sign:                                           | Optional organization Id. Will be required in API version 4. |