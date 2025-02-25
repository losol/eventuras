# Products
(*products*)

## Overview

### Available Operations

* [getV3ProductsProductIdSummary](#getv3productsproductidsummary)

## getV3ProductsProductIdSummary

### Example Usage

```typescript
import { EnrollmentsSDK } from "enrollments-sdk";

const enrollmentsSDK = new EnrollmentsSDK({
  bearer: process.env["ENROLLMENTSSDK_BEARER"] ?? "",
});

async function run() {
  const result = await enrollmentsSDK.products.getV3ProductsProductIdSummary({
    productId: 653493,
  });

  // Handle the result
  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { EnrollmentsSDKCore } from "enrollments-sdk/core.js";
import { productsGetV3ProductsProductIdSummary } from "enrollments-sdk/funcs/productsGetV3ProductsProductIdSummary.js";

// Use `EnrollmentsSDKCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const enrollmentsSDK = new EnrollmentsSDKCore({
  bearer: process.env["ENROLLMENTSSDK_BEARER"] ?? "",
});

async function run() {
  const res = await productsGetV3ProductsProductIdSummary(enrollmentsSDK, {
    productId: 653493,
  });

  if (!res.ok) {
    throw res.error;
  }

  const { value: result } = res;

  // Handle the result
  console.log(result);
}

run();
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `request`                                                                                                                                                                      | [operations.GetV3ProductsProductIdSummaryRequest](../../models/operations/getv3productsproductidsummaryrequest.md)                                                             | :heavy_check_mark:                                                                                                                                                             | The request object to use for the request.                                                                                                                                     |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[operations.GetV3ProductsProductIdSummaryResponse](../../models/operations/getv3productsproductidsummaryresponse.md)\>**

### Errors

| Error Type      | Status Code     | Content Type    |
| --------------- | --------------- | --------------- |
| errors.APIError | 4XX, 5XX        | \*/\*           |