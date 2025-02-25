# EmailNotificationDto

## Example Usage

```typescript
import { EmailNotificationDto } from "eventuras-sdk-v2/models/components";

let value: EmailNotificationDto = {
  subject: "<value>",
  bodyMarkdown: "<value>",
};
```

## Fields

| Field                                                                                          | Type                                                                                           | Required                                                                                       | Description                                                                                    |
| ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `recipients`                                                                                   | *string*[]                                                                                     | :heavy_minus_sign:                                                                             | N/A                                                                                            |
| `eventParticipants`                                                                            | [components.EventParticipantsFilterDto](../../models/components/eventparticipantsfilterdto.md) | :heavy_minus_sign:                                                                             | N/A                                                                                            |
| `subject`                                                                                      | *string*                                                                                       | :heavy_check_mark:                                                                             | N/A                                                                                            |
| `registrationId`                                                                               | *number*                                                                                       | :heavy_minus_sign:                                                                             | N/A                                                                                            |
| `bodyMarkdown`                                                                                 | *string*                                                                                       | :heavy_check_mark:                                                                             | N/A                                                                                            |