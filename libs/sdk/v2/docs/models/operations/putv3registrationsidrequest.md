# PutV3RegistrationsIdRequest

## Example Usage

```typescript
import { PutV3RegistrationsIdRequest } from "eventuras-sdk-v2/models/operations";

let value: PutV3RegistrationsIdRequest = {
  id: 466311,
};
```

## Fields

| Field                                                                                | Type                                                                                 | Required                                                                             | Description                                                                          |
| ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| `id`                                                                                 | *number*                                                                             | :heavy_check_mark:                                                                   | N/A                                                                                  |
| `eventurasOrgId`                                                                     | *number*                                                                             | :heavy_minus_sign:                                                                   | Optional organization Id. Will be required in API version 4.                         |
| `registrationUpdateDto`                                                              | [components.RegistrationUpdateDto](../../models/components/registrationupdatedto.md) | :heavy_minus_sign:                                                                   | N/A                                                                                  |