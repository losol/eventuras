# PutV3OrganizationsOrganizationIdMembersUserIdRequest

## Example Usage

```typescript
import { PutV3OrganizationsOrganizationIdMembersUserIdRequest } from "eventuras-sdk-v2/models/operations";

let value: PutV3OrganizationsOrganizationIdMembersUserIdRequest = {
  organizationId: 666767,
  userId: "<id>",
};
```

## Fields

| Field                                                        | Type                                                         | Required                                                     | Description                                                  |
| ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| `organizationId`                                             | *number*                                                     | :heavy_check_mark:                                           | N/A                                                          |
| `userId`                                                     | *string*                                                     | :heavy_check_mark:                                           | N/A                                                          |
| `eventurasOrgId`                                             | *number*                                                     | :heavy_minus_sign:                                           | Optional organization Id. Will be required in API version 4. |