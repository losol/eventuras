# PutV3OrganizationsOrganizationIdRequest

## Example Usage

```typescript
import { PutV3OrganizationsOrganizationIdRequest } from "enrollments-sdk/models/operations";

let value: PutV3OrganizationsOrganizationIdRequest = {
  organizationId: 128926,
};
```

## Fields

| Field                                                                            | Type                                                                             | Required                                                                         | Description                                                                      |
| -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `organizationId`                                                                 | *number*                                                                         | :heavy_check_mark:                                                               | N/A                                                                              |
| `eventurasOrgId`                                                                 | *number*                                                                         | :heavy_minus_sign:                                                               | Optional organization Id. Will be required in API version 4.                     |
| `organizationFormDto`                                                            | [components.OrganizationFormDto](../../models/components/organizationformdto.md) | :heavy_minus_sign:                                                               | N/A                                                                              |