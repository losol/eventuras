# EventCertificates
(*eventCertificates*)

## Overview

### Available Operations

* [getV3EventIdCertificates](#getv3eventidcertificates)
* [getV3EventIdCertificatesPreview](#getv3eventidcertificatespreview)
* [postV3EventIdCertificatesIssue](#postv3eventidcertificatesissue)
* [postV3EventIdCertificatesUpdate](#postv3eventidcertificatesupdate)

## getV3EventIdCertificates

### Example Usage

```typescript
import { EnrollmentsSDK } from "enrollments-sdk";

const enrollmentsSDK = new EnrollmentsSDK({
  bearer: process.env["ENROLLMENTSSDK_BEARER"] ?? "",
});

async function run() {
  await enrollmentsSDK.eventCertificates.getV3EventIdCertificates({
    id: 746981,
  });


}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { EnrollmentsSDKCore } from "enrollments-sdk/core.js";
import { eventCertificatesGetV3EventIdCertificates } from "enrollments-sdk/funcs/eventCertificatesGetV3EventIdCertificates.js";

// Use `EnrollmentsSDKCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const enrollmentsSDK = new EnrollmentsSDKCore({
  bearer: process.env["ENROLLMENTSSDK_BEARER"] ?? "",
});

async function run() {
  const res = await eventCertificatesGetV3EventIdCertificates(enrollmentsSDK, {
    id: 746981,
  });

  if (!res.ok) {
    throw res.error;
  }

  const { value: result } = res;

  
}

run();
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `request`                                                                                                                                                                      | [operations.GetV3EventIdCertificatesRequest](../../models/operations/getv3eventidcertificatesrequest.md)                                                                       | :heavy_check_mark:                                                                                                                                                             | The request object to use for the request.                                                                                                                                     |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<void\>**

### Errors

| Error Type      | Status Code     | Content Type    |
| --------------- | --------------- | --------------- |
| errors.APIError | 4XX, 5XX        | \*/\*           |

## getV3EventIdCertificatesPreview

### Example Usage

```typescript
import { EnrollmentsSDK } from "enrollments-sdk";

const enrollmentsSDK = new EnrollmentsSDK({
  bearer: process.env["ENROLLMENTSSDK_BEARER"] ?? "",
});

async function run() {
  await enrollmentsSDK.eventCertificates.getV3EventIdCertificatesPreview({
    id: 527755,
  });


}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { EnrollmentsSDKCore } from "enrollments-sdk/core.js";
import { eventCertificatesGetV3EventIdCertificatesPreview } from "enrollments-sdk/funcs/eventCertificatesGetV3EventIdCertificatesPreview.js";

// Use `EnrollmentsSDKCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const enrollmentsSDK = new EnrollmentsSDKCore({
  bearer: process.env["ENROLLMENTSSDK_BEARER"] ?? "",
});

async function run() {
  const res = await eventCertificatesGetV3EventIdCertificatesPreview(enrollmentsSDK, {
    id: 527755,
  });

  if (!res.ok) {
    throw res.error;
  }

  const { value: result } = res;

  
}

run();
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `request`                                                                                                                                                                      | [operations.GetV3EventIdCertificatesPreviewRequest](../../models/operations/getv3eventidcertificatespreviewrequest.md)                                                         | :heavy_check_mark:                                                                                                                                                             | The request object to use for the request.                                                                                                                                     |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<void\>**

### Errors

| Error Type      | Status Code     | Content Type    |
| --------------- | --------------- | --------------- |
| errors.APIError | 4XX, 5XX        | \*/\*           |

## postV3EventIdCertificatesIssue

### Example Usage

```typescript
import { EnrollmentsSDK } from "enrollments-sdk";

const enrollmentsSDK = new EnrollmentsSDK({
  bearer: process.env["ENROLLMENTSSDK_BEARER"] ?? "",
});

async function run() {
  await enrollmentsSDK.eventCertificates.postV3EventIdCertificatesIssue({
    id: 25450,
  });


}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { EnrollmentsSDKCore } from "enrollments-sdk/core.js";
import { eventCertificatesPostV3EventIdCertificatesIssue } from "enrollments-sdk/funcs/eventCertificatesPostV3EventIdCertificatesIssue.js";

// Use `EnrollmentsSDKCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const enrollmentsSDK = new EnrollmentsSDKCore({
  bearer: process.env["ENROLLMENTSSDK_BEARER"] ?? "",
});

async function run() {
  const res = await eventCertificatesPostV3EventIdCertificatesIssue(enrollmentsSDK, {
    id: 25450,
  });

  if (!res.ok) {
    throw res.error;
  }

  const { value: result } = res;

  
}

run();
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `request`                                                                                                                                                                      | [operations.PostV3EventIdCertificatesIssueRequest](../../models/operations/postv3eventidcertificatesissuerequest.md)                                                           | :heavy_check_mark:                                                                                                                                                             | The request object to use for the request.                                                                                                                                     |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<void\>**

### Errors

| Error Type      | Status Code     | Content Type    |
| --------------- | --------------- | --------------- |
| errors.APIError | 4XX, 5XX        | \*/\*           |

## postV3EventIdCertificatesUpdate

### Example Usage

```typescript
import { EnrollmentsSDK } from "enrollments-sdk";

const enrollmentsSDK = new EnrollmentsSDK({
  bearer: process.env["ENROLLMENTSSDK_BEARER"] ?? "",
});

async function run() {
  await enrollmentsSDK.eventCertificates.postV3EventIdCertificatesUpdate({
    id: 697126,
  });


}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { EnrollmentsSDKCore } from "enrollments-sdk/core.js";
import { eventCertificatesPostV3EventIdCertificatesUpdate } from "enrollments-sdk/funcs/eventCertificatesPostV3EventIdCertificatesUpdate.js";

// Use `EnrollmentsSDKCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const enrollmentsSDK = new EnrollmentsSDKCore({
  bearer: process.env["ENROLLMENTSSDK_BEARER"] ?? "",
});

async function run() {
  const res = await eventCertificatesPostV3EventIdCertificatesUpdate(enrollmentsSDK, {
    id: 697126,
  });

  if (!res.ok) {
    throw res.error;
  }

  const { value: result } = res;

  
}

run();
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `request`                                                                                                                                                                      | [operations.PostV3EventIdCertificatesUpdateRequest](../../models/operations/postv3eventidcertificatesupdaterequest.md)                                                         | :heavy_check_mark:                                                                                                                                                             | The request object to use for the request.                                                                                                                                     |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<void\>**

### Errors

| Error Type      | Status Code     | Content Type    |
| --------------- | --------------- | --------------- |
| errors.APIError | 4XX, 5XX        | \*/\*           |