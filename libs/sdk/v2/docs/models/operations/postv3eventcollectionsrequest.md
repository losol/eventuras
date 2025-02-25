# PostV3EventcollectionsRequest

## Example Usage

```typescript
import { PostV3EventcollectionsRequest } from "eventuras-sdk-v2/models/operations";

let value: PostV3EventcollectionsRequest = {};
```

## Fields

| Field                                                                                      | Type                                                                                       | Required                                                                                   | Description                                                                                |
| ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| `eventurasOrgId`                                                                           | *number*                                                                                   | :heavy_minus_sign:                                                                         | Optional organization Id. Will be required in API version 4.                               |
| `eventCollectionCreateDto`                                                                 | [components.EventCollectionCreateDto](../../models/components/eventcollectioncreatedto.md) | :heavy_minus_sign:                                                                         | N/A                                                                                        |