# PutV3OrganizationsOrganizationIdSettingsRequest

## Example Usage

```typescript
import { PutV3OrganizationsOrganizationIdSettingsRequest } from "enrollments-sdk/models/operations";

let value: PutV3OrganizationsOrganizationIdSettingsRequest = {
  organizationId: 570197,
};
```

## Fields

| Field                                                                                            | Type                                                                                             | Required                                                                                         | Description                                                                                      |
| ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| `organizationId`                                                                                 | *number*                                                                                         | :heavy_check_mark:                                                                               | N/A                                                                                              |
| `eventurasOrgId`                                                                                 | *number*                                                                                         | :heavy_minus_sign:                                                                               | Optional organization Id. Will be required in API version 4.                                     |
| `organizationSettingValueDto`                                                                    | [components.OrganizationSettingValueDto](../../models/components/organizationsettingvaluedto.md) | :heavy_minus_sign:                                                                               | N/A                                                                                              |