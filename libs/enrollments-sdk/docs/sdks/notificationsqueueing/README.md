# NotificationsQueueing
(*notificationsQueueing*)

## Overview

### Available Operations

* [postV3NotificationsEmail](#postv3notificationsemail)
* [postV3NotificationsSms](#postv3notificationssms)

## postV3NotificationsEmail

### Example Usage

```typescript
import { EnrollmentsSDK } from "enrollments-sdk";

const enrollmentsSDK = new EnrollmentsSDK({
  bearer: process.env["ENROLLMENTSSDK_BEARER"] ?? "",
});

async function run() {
  const result = await enrollmentsSDK.notificationsQueueing.postV3NotificationsEmail({});

  // Handle the result
  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { EnrollmentsSDKCore } from "enrollments-sdk/core.js";
import { notificationsQueueingPostV3NotificationsEmail } from "enrollments-sdk/funcs/notificationsQueueingPostV3NotificationsEmail.js";

// Use `EnrollmentsSDKCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const enrollmentsSDK = new EnrollmentsSDKCore({
  bearer: process.env["ENROLLMENTSSDK_BEARER"] ?? "",
});

async function run() {
  const res = await notificationsQueueingPostV3NotificationsEmail(enrollmentsSDK, {});

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
| `request`                                                                                                                                                                      | [operations.PostV3NotificationsEmailRequest](../../models/operations/postv3notificationsemailrequest.md)                                                                       | :heavy_check_mark:                                                                                                                                                             | The request object to use for the request.                                                                                                                                     |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[operations.PostV3NotificationsEmailResponse](../../models/operations/postv3notificationsemailresponse.md)\>**

### Errors

| Error Type      | Status Code     | Content Type    |
| --------------- | --------------- | --------------- |
| errors.APIError | 4XX, 5XX        | \*/\*           |

## postV3NotificationsSms

### Example Usage

```typescript
import { EnrollmentsSDK } from "enrollments-sdk";

const enrollmentsSDK = new EnrollmentsSDK({
  bearer: process.env["ENROLLMENTSSDK_BEARER"] ?? "",
});

async function run() {
  const result = await enrollmentsSDK.notificationsQueueing.postV3NotificationsSms({});

  // Handle the result
  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { EnrollmentsSDKCore } from "enrollments-sdk/core.js";
import { notificationsQueueingPostV3NotificationsSms } from "enrollments-sdk/funcs/notificationsQueueingPostV3NotificationsSms.js";

// Use `EnrollmentsSDKCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const enrollmentsSDK = new EnrollmentsSDKCore({
  bearer: process.env["ENROLLMENTSSDK_BEARER"] ?? "",
});

async function run() {
  const res = await notificationsQueueingPostV3NotificationsSms(enrollmentsSDK, {});

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
| `request`                                                                                                                                                                      | [operations.PostV3NotificationsSmsRequest](../../models/operations/postv3notificationssmsrequest.md)                                                                           | :heavy_check_mark:                                                                                                                                                             | The request object to use for the request.                                                                                                                                     |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[operations.PostV3NotificationsSmsResponse](../../models/operations/postv3notificationssmsresponse.md)\>**

### Errors

| Error Type      | Status Code     | Content Type    |
| --------------- | --------------- | --------------- |
| errors.APIError | 4XX, 5XX        | \*/\*           |