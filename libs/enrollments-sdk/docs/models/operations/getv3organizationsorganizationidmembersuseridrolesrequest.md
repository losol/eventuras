# GetV3OrganizationsOrganizationIdMembersUserIdRolesRequest

## Example Usage

```typescript
import { GetV3OrganizationsOrganizationIdMembersUserIdRolesRequest } from "enrollments-sdk/models/operations";

let value: GetV3OrganizationsOrganizationIdMembersUserIdRolesRequest = {
  organizationId: 437032,
  userId: "<id>",
};
```

## Fields

| Field                                                        | Type                                                         | Required                                                     | Description                                                  |
| ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| `organizationId`                                             | *number*                                                     | :heavy_check_mark:                                           | N/A                                                          |
| `userId`                                                     | *string*                                                     | :heavy_check_mark:                                           | N/A                                                          |
| `eventurasOrgId`                                             | *number*                                                     | :heavy_minus_sign:                                           | Optional organization Id. Will be required in API version 4. |