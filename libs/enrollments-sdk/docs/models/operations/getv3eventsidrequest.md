# GetV3EventsIdRequest

## Example Usage

```typescript
import { GetV3EventsIdRequest } from "enrollments-sdk/models/operations";

let value: GetV3EventsIdRequest = {
  id: 521848,
};
```

## Fields

| Field                                                        | Type                                                         | Required                                                     | Description                                                  |
| ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| `id`                                                         | *number*                                                     | :heavy_check_mark:                                           | The ID of the event.                                         |
| `eventurasOrgId`                                             | *number*                                                     | :heavy_minus_sign:                                           | Optional organization Id. Will be required in API version 4. |