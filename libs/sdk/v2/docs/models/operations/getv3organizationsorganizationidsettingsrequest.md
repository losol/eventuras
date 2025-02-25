# GetV3OrganizationsOrganizationIdSettingsRequest

## Example Usage

```typescript
import { GetV3OrganizationsOrganizationIdSettingsRequest } from "eventuras-sdk-v2/models/operations";

let value: GetV3OrganizationsOrganizationIdSettingsRequest = {
  organizationId: 363711,
};
```

## Fields

| Field                                                        | Type                                                         | Required                                                     | Description                                                  |
| ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| `organizationId`                                             | *number*                                                     | :heavy_check_mark:                                           | N/A                                                          |
| `eventurasOrgId`                                             | *number*                                                     | :heavy_minus_sign:                                           | Optional organization Id. Will be required in API version 4. |