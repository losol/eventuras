# PostV3NotificationsSmsRequest

## Example Usage

```typescript
import { PostV3NotificationsSmsRequest } from "eventuras-sdk-v2/models/operations";

let value: PostV3NotificationsSmsRequest = {};
```

## Fields

| Field                                                                          | Type                                                                           | Required                                                                       | Description                                                                    |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| `eventurasOrgId`                                                               | *number*                                                                       | :heavy_minus_sign:                                                             | Optional organization Id. Will be required in API version 4.                   |
| `smsNotificationDto`                                                           | [components.SmsNotificationDto](../../models/components/smsnotificationdto.md) | :heavy_minus_sign:                                                             | N/A                                                                            |