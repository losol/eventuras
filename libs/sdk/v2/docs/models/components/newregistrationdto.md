# NewRegistrationDto

## Example Usage

```typescript
import { NewRegistrationDto } from "eventuras-sdk-v2/models/components";

let value: NewRegistrationDto = {
  userId: "<id>",
  eventId: 118727,
};
```

## Fields

| Field                                                                                            | Type                                                                                             | Required                                                                                         | Description                                                                                      |
| ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| `customer`                                                                                       | [components.RegistrationCustomerInfoDto](../../models/components/registrationcustomerinfodto.md) | :heavy_minus_sign:                                                                               | N/A                                                                                              |
| `notes`                                                                                          | *string*                                                                                         | :heavy_minus_sign:                                                                               | N/A                                                                                              |
| `type`                                                                                           | [components.RegistrationType](../../models/components/registrationtype.md)                       | :heavy_minus_sign:                                                                               | N/A                                                                                              |
| `paymentMethod`                                                                                  | [components.PaymentProvider](../../models/components/paymentprovider.md)                         | :heavy_minus_sign:                                                                               | N/A                                                                                              |
| `userId`                                                                                         | *string*                                                                                         | :heavy_check_mark:                                                                               | N/A                                                                                              |
| `eventId`                                                                                        | *number*                                                                                         | :heavy_check_mark:                                                                               | N/A                                                                                              |
| `createOrder`                                                                                    | *boolean*                                                                                        | :heavy_minus_sign:                                                                               | N/A                                                                                              |
| `sendWelcomeLetter`                                                                              | *boolean*                                                                                        | :heavy_minus_sign:                                                                               | N/A                                                                                              |