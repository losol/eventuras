# PostV3InvoicesRequest

## Example Usage

```typescript
import { PostV3InvoicesRequest } from "eventuras-sdk-v2/models/operations";

let value: PostV3InvoicesRequest = {};
```

## Fields

| Field                                                                        | Type                                                                         | Required                                                                     | Description                                                                  |
| ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `eventurasOrgId`                                                             | *number*                                                                     | :heavy_minus_sign:                                                           | Optional organization Id. Will be required in API version 4.                 |
| `invoiceRequestDto`                                                          | [components.InvoiceRequestDto](../../models/components/invoicerequestdto.md) | :heavy_minus_sign:                                                           | N/A                                                                          |