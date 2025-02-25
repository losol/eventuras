# RegistrationDto

## Example Usage

```typescript
import { RegistrationDto } from "eventuras-sdk-v2/models/components";

let value: RegistrationDto = {};
```

## Fields

| Field                                                                          | Type                                                                           | Required                                                                       | Description                                                                    |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| `registrationId`                                                               | *number*                                                                       | :heavy_minus_sign:                                                             | N/A                                                                            |
| `eventId`                                                                      | *number*                                                                       | :heavy_minus_sign:                                                             | N/A                                                                            |
| `userId`                                                                       | *string*                                                                       | :heavy_minus_sign:                                                             | N/A                                                                            |
| `status`                                                                       | [components.RegistrationStatus](../../models/components/registrationstatus.md) | :heavy_minus_sign:                                                             | N/A                                                                            |
| `type`                                                                         | [components.RegistrationType](../../models/components/registrationtype.md)     | :heavy_minus_sign:                                                             | N/A                                                                            |
| `certificateId`                                                                | *number*                                                                       | :heavy_minus_sign:                                                             | N/A                                                                            |
| `notes`                                                                        | *string*                                                                       | :heavy_minus_sign:                                                             | N/A                                                                            |
| `log`                                                                          | *string*                                                                       | :heavy_minus_sign:                                                             | N/A                                                                            |
| `user`                                                                         | [components.UserDto](../../models/components/userdto.md)                       | :heavy_minus_sign:                                                             | N/A                                                                            |
| `event`                                                                        | [components.EventDto](../../models/components/eventdto.md)                     | :heavy_minus_sign:                                                             | N/A                                                                            |
| `products`                                                                     | [components.ProductOrderDto](../../models/components/productorderdto.md)[]     | :heavy_minus_sign:                                                             | N/A                                                                            |
| `orders`                                                                       | [components.OrderDto](../../models/components/orderdto.md)[]                   | :heavy_minus_sign:                                                             | N/A                                                                            |