# PostV3OrganizationsOrganizationIdSettingsRequest

## Example Usage

```typescript
import { PostV3OrganizationsOrganizationIdSettingsRequest } from "enrollments-sdk/models/operations";

let value: PostV3OrganizationsOrganizationIdSettingsRequest = {
  organizationId: 438601,
  requestBody: [
    {
      name: "<value>",
    },
  ],
};
```

## Fields

| Field                                                                                              | Type                                                                                               | Required                                                                                           | Description                                                                                        |
| -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `organizationId`                                                                                   | *number*                                                                                           | :heavy_check_mark:                                                                                 | N/A                                                                                                |
| `eventurasOrgId`                                                                                   | *number*                                                                                           | :heavy_minus_sign:                                                                                 | Optional organization Id. Will be required in API version 4.                                       |
| `requestBody`                                                                                      | [components.OrganizationSettingValueDto](../../models/components/organizationsettingvaluedto.md)[] | :heavy_check_mark:                                                                                 | N/A                                                                                                |