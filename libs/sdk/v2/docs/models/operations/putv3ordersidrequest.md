# PutV3OrdersIdRequest

## Example Usage

```typescript
import { PutV3OrdersIdRequest } from "eventuras-sdk-v2/models/operations";

let value: PutV3OrdersIdRequest = {
  id: 681820,
};
```

## Fields

| Field                                                                                | Type                                                                                 | Required                                                                             | Description                                                                          |
| ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| `id`                                                                                 | *number*                                                                             | :heavy_check_mark:                                                                   | N/A                                                                                  |
| `eventurasOrgId`                                                                     | *number*                                                                             | :heavy_minus_sign:                                                                   | Optional organization Id. Will be required in API version 4.                         |
| `orderUpdateRequestDto`                                                              | [components.OrderUpdateRequestDto](../../models/components/orderupdaterequestdto.md) | :heavy_minus_sign:                                                                   | N/A                                                                                  |