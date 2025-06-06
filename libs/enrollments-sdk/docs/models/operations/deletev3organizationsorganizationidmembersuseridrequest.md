# DeleteV3OrganizationsOrganizationIdMembersUserIdRequest

## Example Usage

```typescript
import { DeleteV3OrganizationsOrganizationIdMembersUserIdRequest } from "enrollments-sdk/models/operations";

let value: DeleteV3OrganizationsOrganizationIdMembersUserIdRequest = {
  organizationId: 670638,
  userId: "<id>",
};
```

## Fields

| Field                                                        | Type                                                         | Required                                                     | Description                                                  |
| ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| `organizationId`                                             | *number*                                                     | :heavy_check_mark:                                           | N/A                                                          |
| `userId`                                                     | *string*                                                     | :heavy_check_mark:                                           | N/A                                                          |
| `eventurasOrgId`                                             | *number*                                                     | :heavy_minus_sign:                                           | Optional organization Id. Will be required in API version 4. |