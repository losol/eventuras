<!-- Start SDK Example Usage [usage] -->
```typescript
import { EnrollmentsSDK } from "enrollments-sdk";

const enrollmentsSDK = new EnrollmentsSDK({
  bearer: process.env["ENROLLMENTSSDK_BEARER"] ?? "",
});

async function run() {
  const result = await enrollmentsSDK.certificates.getV3CertificatesId({
    id: 62194,
  });

  // Handle the result
  console.log(result);
}

run();

```
<!-- End SDK Example Usage [usage] -->