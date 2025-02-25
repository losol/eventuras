# NewOrderRequestDto

## Example Usage

```typescript
import { NewOrderRequestDto } from "enrollments-sdk/models/components";

let value: NewOrderRequestDto = {
  lines: [
    {},
  ],
  registrationId: 120196,
};
```

## Fields

| Field                                                                    | Type                                                                     | Required                                                                 | Description                                                              |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------ | ------------------------------------------------------------------------ | ------------------------------------------------------------------------ |
| `lines`                                                                  | [components.OrderLineModel](../../models/components/orderlinemodel.md)[] | :heavy_check_mark:                                                       | N/A                                                                      |
| `registrationId`                                                         | *number*                                                                 | :heavy_check_mark:                                                       | N/A                                                                      |