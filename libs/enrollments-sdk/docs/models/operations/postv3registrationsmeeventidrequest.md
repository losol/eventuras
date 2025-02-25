# PostV3RegistrationsMeEventIdRequest

## Example Usage

```typescript
import { PostV3RegistrationsMeEventIdRequest } from "enrollments-sdk/models/operations";

let value: PostV3RegistrationsMeEventIdRequest = {
  eventId: 110375,
};
```

## Fields

| Field                                                        | Type                                                         | Required                                                     | Description                                                  |
| ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| `eventId`                                                    | *number*                                                     | :heavy_check_mark:                                           | N/A                                                          |
| `createOrder`                                                | *boolean*                                                    | :heavy_minus_sign:                                           | N/A                                                          |
| `eventurasOrgId`                                             | *number*                                                     | :heavy_minus_sign:                                           | Optional organization Id. Will be required in API version 4. |