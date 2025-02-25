# PostV3RegistrationsIdOrdersRequest

## Example Usage

```typescript
import { PostV3RegistrationsIdOrdersRequest } from "enrollments-sdk/models/operations";

let value: PostV3RegistrationsIdOrdersRequest = {
  id: 161309,
};
```

## Fields

| Field                                                                                    | Type                                                                                     | Required                                                                                 | Description                                                                              |
| ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `id`                                                                                     | *number*                                                                                 | :heavy_check_mark:                                                                       | N/A                                                                                      |
| `eventurasOrgId`                                                                         | *number*                                                                                 | :heavy_minus_sign:                                                                       | Optional organization Id. Will be required in API version 4.                             |
| `newRegistrationOrderDto`                                                                | [components.NewRegistrationOrderDto](../../models/components/newregistrationorderdto.md) | :heavy_minus_sign:                                                                       | N/A                                                                                      |