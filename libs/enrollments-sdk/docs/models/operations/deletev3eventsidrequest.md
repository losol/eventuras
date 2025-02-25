# DeleteV3EventsIdRequest

## Example Usage

```typescript
import { DeleteV3EventsIdRequest } from "enrollments-sdk/models/operations";

let value: DeleteV3EventsIdRequest = {
  id: 774234,
};
```

## Fields

| Field                                                        | Type                                                         | Required                                                     | Description                                                  |
| ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| `id`                                                         | *number*                                                     | :heavy_check_mark:                                           | The ID of the event to delete.                               |
| `eventurasOrgId`                                             | *number*                                                     | :heavy_minus_sign:                                           | Optional organization Id. Will be required in API version 4. |