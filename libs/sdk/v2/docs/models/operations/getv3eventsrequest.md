# GetV3EventsRequest

## Example Usage

```typescript
import { GetV3EventsRequest } from "eventuras-sdk-v2/models/operations";

let value: GetV3EventsRequest = {};
```

## Fields

| Field                                                                          | Type                                                                           | Required                                                                       | Description                                                                    |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| `type`                                                                         | [components.EventInfoType](../../models/components/eventinfotype.md)           | :heavy_minus_sign:                                                             | N/A                                                                            |
| `start`                                                                        | [RFCDate](../../types/rfcdate.md)                                              | :heavy_minus_sign:                                                             | N/A                                                                            |
| `end`                                                                          | [RFCDate](../../types/rfcdate.md)                                              | :heavy_minus_sign:                                                             | N/A                                                                            |
| `period`                                                                       | [components.PeriodMatchingKind](../../models/components/periodmatchingkind.md) | :heavy_minus_sign:                                                             | N/A                                                                            |
| `includePastEvents`                                                            | *boolean*                                                                      | :heavy_minus_sign:                                                             | N/A                                                                            |
| `includeDraftEvents`                                                           | *boolean*                                                                      | :heavy_minus_sign:                                                             | N/A                                                                            |
| `organizationId`                                                               | *number*                                                                       | :heavy_minus_sign:                                                             | N/A                                                                            |
| `collectionId`                                                                 | *number*                                                                       | :heavy_minus_sign:                                                             | N/A                                                                            |
| `page`                                                                         | *number*                                                                       | :heavy_minus_sign:                                                             | N/A                                                                            |
| `count`                                                                        | *number*                                                                       | :heavy_minus_sign:                                                             | N/A                                                                            |
| `limit`                                                                        | *number*                                                                       | :heavy_minus_sign:                                                             | N/A                                                                            |
| `offset`                                                                       | *number*                                                                       | :heavy_minus_sign:                                                             | N/A                                                                            |
| `ordering`                                                                     | *string*[]                                                                     | :heavy_minus_sign:                                                             | N/A                                                                            |
| `eventurasOrgId`                                                               | *number*                                                                       | :heavy_minus_sign:                                                             | Optional organization Id. Will be required in API version 4.                   |