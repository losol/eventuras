# GetV3OrganizationsOrganizationIdRequest

## Example Usage

```typescript
import { GetV3OrganizationsOrganizationIdRequest } from "enrollments-sdk/models/operations";

let value: GetV3OrganizationsOrganizationIdRequest = {
  organizationId: 210382,
};
```

## Fields

| Field                                                        | Type                                                         | Required                                                     | Description                                                  |
| ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| `organizationId`                                             | *number*                                                     | :heavy_check_mark:                                           | N/A                                                          |
| `eventurasOrgId`                                             | *number*                                                     | :heavy_minus_sign:                                           | Optional organization Id. Will be required in API version 4. |