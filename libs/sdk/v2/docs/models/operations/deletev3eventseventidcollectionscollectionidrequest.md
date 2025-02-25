# DeleteV3EventsEventIdCollectionsCollectionIdRequest

## Example Usage

```typescript
import { DeleteV3EventsEventIdCollectionsCollectionIdRequest } from "eventuras-sdk-v2/models/operations";

let value: DeleteV3EventsEventIdCollectionsCollectionIdRequest = {
  eventId: 925597,
  collectionId: 71036,
};
```

## Fields

| Field                                                        | Type                                                         | Required                                                     | Description                                                  |
| ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| `eventId`                                                    | *number*                                                     | :heavy_check_mark:                                           | N/A                                                          |
| `collectionId`                                               | *number*                                                     | :heavy_check_mark:                                           | N/A                                                          |
| `eventurasOrgId`                                             | *number*                                                     | :heavy_minus_sign:                                           | Optional organization Id. Will be required in API version 4. |