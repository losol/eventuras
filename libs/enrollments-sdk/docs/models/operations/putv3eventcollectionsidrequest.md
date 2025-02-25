# PutV3EventcollectionsIdRequest

## Example Usage

```typescript
import { PutV3EventcollectionsIdRequest } from "enrollments-sdk/models/operations";

let value: PutV3EventcollectionsIdRequest = {
  id: 963663,
};
```

## Fields

| Field                                                                          | Type                                                                           | Required                                                                       | Description                                                                    |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| `id`                                                                           | *number*                                                                       | :heavy_check_mark:                                                             | N/A                                                                            |
| `eventurasOrgId`                                                               | *number*                                                                       | :heavy_minus_sign:                                                             | Optional organization Id. Will be required in API version 4.                   |
| `eventCollectionDto`                                                           | [components.EventCollectionDto](../../models/components/eventcollectiondto.md) | :heavy_minus_sign:                                                             | N/A                                                                            |