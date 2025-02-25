# PutV3UsersIdRequest

## Example Usage

```typescript
import { PutV3UsersIdRequest } from "eventuras-sdk-v2/models/operations";

let value: PutV3UsersIdRequest = {
  id: "<id>",
};
```

## Fields

| Field                                                            | Type                                                             | Required                                                         | Description                                                      |
| ---------------------------------------------------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------- |
| `id`                                                             | *string*                                                         | :heavy_check_mark:                                               | N/A                                                              |
| `eventurasOrgId`                                                 | *number*                                                         | :heavy_minus_sign:                                               | Optional organization Id. Will be required in API version 4.     |
| `userFormDto`                                                    | [components.UserFormDto](../../models/components/userformdto.md) | :heavy_minus_sign:                                               | N/A                                                              |