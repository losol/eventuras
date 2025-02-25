# PutV3UserprofileRequest

## Example Usage

```typescript
import { PutV3UserprofileRequest } from "enrollments-sdk/models/operations";

let value: PutV3UserprofileRequest = {};
```

## Fields

| Field                                                            | Type                                                             | Required                                                         | Description                                                      |
| ---------------------------------------------------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------- |
| `id`                                                             | *string*                                                         | :heavy_minus_sign:                                               | N/A                                                              |
| `eventurasOrgId`                                                 | *number*                                                         | :heavy_minus_sign:                                               | Optional organization Id. Will be required in API version 4.     |
| `userFormDto`                                                    | [components.UserFormDto](../../models/components/userformdto.md) | :heavy_minus_sign:                                               | N/A                                                              |