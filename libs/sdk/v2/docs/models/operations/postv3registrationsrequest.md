# PostV3RegistrationsRequest

## Example Usage

```typescript
import { PostV3RegistrationsRequest } from "eventuras-sdk-v2/models/operations";

let value: PostV3RegistrationsRequest = {};
```

## Fields

| Field                                                                          | Type                                                                           | Required                                                                       | Description                                                                    |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| `eventurasOrgId`                                                               | *number*                                                                       | :heavy_minus_sign:                                                             | Optional organization Id. Will be required in API version 4.                   |
| `newRegistrationDto`                                                           | [components.NewRegistrationDto](../../models/components/newregistrationdto.md) | :heavy_minus_sign:                                                             | N/A                                                                            |