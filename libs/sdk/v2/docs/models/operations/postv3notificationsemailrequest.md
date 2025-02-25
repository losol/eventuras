# PostV3NotificationsEmailRequest

## Example Usage

```typescript
import { PostV3NotificationsEmailRequest } from "eventuras-sdk-v2/models/operations";

let value: PostV3NotificationsEmailRequest = {};
```

## Fields

| Field                                                                              | Type                                                                               | Required                                                                           | Description                                                                        |
| ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `eventurasOrgId`                                                                   | *number*                                                                           | :heavy_minus_sign:                                                                 | Optional organization Id. Will be required in API version 4.                       |
| `emailNotificationDto`                                                             | [components.EmailNotificationDto](../../models/components/emailnotificationdto.md) | :heavy_minus_sign:                                                                 | N/A                                                                                |