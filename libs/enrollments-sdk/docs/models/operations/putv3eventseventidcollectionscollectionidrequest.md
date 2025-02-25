# PutV3EventsEventIdCollectionsCollectionIdRequest

## Example Usage

```typescript
import { PutV3EventsEventIdCollectionsCollectionIdRequest } from "enrollments-sdk/models/operations";

let value: PutV3EventsEventIdCollectionsCollectionIdRequest = {
  eventId: 528895,
  collectionId: 568045,
};
```

## Fields

| Field                                                        | Type                                                         | Required                                                     | Description                                                  |
| ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| `eventId`                                                    | *number*                                                     | :heavy_check_mark:                                           | N/A                                                          |
| `collectionId`                                               | *number*                                                     | :heavy_check_mark:                                           | N/A                                                          |
| `eventurasOrgId`                                             | *number*                                                     | :heavy_minus_sign:                                           | Optional organization Id. Will be required in API version 4. |