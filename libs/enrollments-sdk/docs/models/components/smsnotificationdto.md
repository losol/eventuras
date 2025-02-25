# SmsNotificationDto

## Example Usage

```typescript
import { SmsNotificationDto } from "enrollments-sdk/models/components";

let value: SmsNotificationDto = {
  message: "<value>",
};
```

## Fields

| Field                                                                                          | Type                                                                                           | Required                                                                                       | Description                                                                                    |
| ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `recipients`                                                                                   | *string*[]                                                                                     | :heavy_minus_sign:                                                                             | N/A                                                                                            |
| `eventParticipants`                                                                            | [components.EventParticipantsFilterDto](../../models/components/eventparticipantsfilterdto.md) | :heavy_minus_sign:                                                                             | N/A                                                                                            |
| `registrationId`                                                                               | *number*                                                                                       | :heavy_minus_sign:                                                                             | N/A                                                                                            |
| `message`                                                                                      | *string*                                                                                       | :heavy_check_mark:                                                                             | N/A                                                                                            |