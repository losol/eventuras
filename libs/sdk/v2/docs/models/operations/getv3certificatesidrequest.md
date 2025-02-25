# GetV3CertificatesIdRequest

## Example Usage

```typescript
import { GetV3CertificatesIdRequest } from "eventuras-sdk-v2/models/operations";

let value: GetV3CertificatesIdRequest = {
  id: 548814,
};
```

## Fields

| Field                                                                        | Type                                                                         | Required                                                                     | Description                                                                  |
| ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `id`                                                                         | *number*                                                                     | :heavy_check_mark:                                                           | N/A                                                                          |
| `format`                                                                     | [components.CertificateFormat](../../models/components/certificateformat.md) | :heavy_minus_sign:                                                           | N/A                                                                          |
| `eventurasOrgId`                                                             | *number*                                                                     | :heavy_minus_sign:                                                           | Optional organization Id. Will be required in API version 4.                 |