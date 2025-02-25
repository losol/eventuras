# DeleteV3OrganizationsOrganizationIdRequest

## Example Usage

```typescript
import { DeleteV3OrganizationsOrganizationIdRequest } from "eventuras-sdk-v2/models/operations";

let value: DeleteV3OrganizationsOrganizationIdRequest = {
  organizationId: 315428,
};
```

## Fields

| Field                                                        | Type                                                         | Required                                                     | Description                                                  |
| ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| `organizationId`                                             | *number*                                                     | :heavy_check_mark:                                           | N/A                                                          |
| `eventurasOrgId`                                             | *number*                                                     | :heavy_minus_sign:                                           | Optional organization Id. Will be required in API version 4. |