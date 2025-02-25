# RegistrationUpdateDto

## Example Usage

```typescript
import { RegistrationUpdateDto } from "eventuras-sdk-v2/models/components";

let value: RegistrationUpdateDto = {};
```

## Fields

| Field                                                                                            | Type                                                                                             | Required                                                                                         | Description                                                                                      |
| ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| `status`                                                                                         | [components.RegistrationStatus](../../models/components/registrationstatus.md)                   | :heavy_minus_sign:                                                                               | N/A                                                                                              |
| `type`                                                                                           | [components.RegistrationType](../../models/components/registrationtype.md)                       | :heavy_minus_sign:                                                                               | N/A                                                                                              |
| `notes`                                                                                          | *string*                                                                                         | :heavy_minus_sign:                                                                               | N/A                                                                                              |
| `customer`                                                                                       | [components.RegistrationCustomerInfoDto](../../models/components/registrationcustomerinfodto.md) | :heavy_minus_sign:                                                                               | N/A                                                                                              |
| `paymentMethod`                                                                                  | [components.PaymentProvider](../../models/components/paymentprovider.md)                         | :heavy_minus_sign:                                                                               | N/A                                                                                              |