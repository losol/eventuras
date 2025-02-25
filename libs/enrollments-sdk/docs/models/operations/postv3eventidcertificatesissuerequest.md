# PostV3EventIdCertificatesIssueRequest

## Example Usage

```typescript
import { PostV3EventIdCertificatesIssueRequest } from "enrollments-sdk/models/operations";

let value: PostV3EventIdCertificatesIssueRequest = {
  id: 544883,
};
```

## Fields

| Field                                                        | Type                                                         | Required                                                     | Description                                                  |
| ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| `id`                                                         | *number*                                                     | :heavy_check_mark:                                           | N/A                                                          |
| `send`                                                       | *boolean*                                                    | :heavy_minus_sign:                                           | N/A                                                          |
| `eventurasOrgId`                                             | *number*                                                     | :heavy_minus_sign:                                           | Optional organization Id. Will be required in API version 4. |