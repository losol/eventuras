# PostV3OrdersRequest

## Example Usage

```typescript
import { PostV3OrdersRequest } from "eventuras-sdk-v2/models/operations";

let value: PostV3OrdersRequest = {};
```

## Fields

| Field                                                                          | Type                                                                           | Required                                                                       | Description                                                                    |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| `eventurasOrgId`                                                               | *number*                                                                       | :heavy_minus_sign:                                                             | Optional organization Id. Will be required in API version 4.                   |
| `newOrderRequestDto`                                                           | [components.NewOrderRequestDto](../../models/components/neworderrequestdto.md) | :heavy_minus_sign:                                                             | N/A                                                                            |