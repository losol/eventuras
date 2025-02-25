<!-- Start SDK Example Usage [usage] -->
```typescript
import { EventurasSDK } from "eventuras-sdk-v2";

const eventurasSDK = new EventurasSDK({
  bearer: process.env["EVENTURASSDK_BEARER"] ?? "",
});

async function run() {
  const result = await eventurasSDK.certificates.getV3CertificatesId({
    id: 62194,
  });

  // Handle the result
  console.log(result);
}

run();

```
<!-- End SDK Example Usage [usage] -->