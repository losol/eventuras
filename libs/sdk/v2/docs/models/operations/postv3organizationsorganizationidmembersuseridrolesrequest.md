# PostV3OrganizationsOrganizationIdMembersUserIdRolesRequest

## Example Usage

```typescript
import { PostV3OrganizationsOrganizationIdMembersUserIdRolesRequest } from "eventuras-sdk-v2/models/operations";

let value: PostV3OrganizationsOrganizationIdMembersUserIdRolesRequest = {
  organizationId: 697631,
  userId: "<id>",
};
```

## Fields

| Field                                                                  | Type                                                                   | Required                                                               | Description                                                            |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------- | ---------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `organizationId`                                                       | *number*                                                               | :heavy_check_mark:                                                     | N/A                                                                    |
| `userId`                                                               | *string*                                                               | :heavy_check_mark:                                                     | N/A                                                                    |
| `eventurasOrgId`                                                       | *number*                                                               | :heavy_minus_sign:                                                     | Optional organization Id. Will be required in API version 4.           |
| `roleRequestDto`                                                       | [components.RoleRequestDto](../../models/components/rolerequestdto.md) | :heavy_minus_sign:                                                     | N/A                                                                    |