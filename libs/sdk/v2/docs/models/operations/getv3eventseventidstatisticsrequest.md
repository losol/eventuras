# GetV3EventsEventIdStatisticsRequest

## Example Usage

```typescript
import { GetV3EventsEventIdStatisticsRequest } from "eventuras-sdk-v2/models/operations";

let value: GetV3EventsEventIdStatisticsRequest = {
  eventId: 456150,
};
```

## Fields

| Field                                                        | Type                                                         | Required                                                     | Description                                                  |
| ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| `eventId`                                                    | *number*                                                     | :heavy_check_mark:                                           | N/A                                                          |
| `eventurasOrgId`                                             | *number*                                                     | :heavy_minus_sign:                                           | Optional organization Id. Will be required in API version 4. |