# PostV3RegistrationsRequest

## Example Usage

```typescript
import { PostV3RegistrationsRequest } from "enrollments-sdk/models/operations";

let value: PostV3RegistrationsRequest = {};
```

## Fields

| Field                                                                          | Type                                                                           | Required                                                                       | Description                                                                    |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| `eventurasOrgId`                                                               | *number*                                                                       | :heavy_minus_sign:                                                             | Optional organization Id. Will be required in API version 4.                   |
| `newRegistrationDto`                                                           | [components.NewRegistrationDto](../../models/components/newregistrationdto.md) | :heavy_minus_sign:                                                             | N/A                                                                            |