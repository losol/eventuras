# UserProfile
(*userProfile*)

## Overview

### Available Operations

* [getV3Userprofile](#getv3userprofile) - Gets information about the current user. Creates a new user if no user with the email exists.
* [putV3Userprofile](#putv3userprofile)

## getV3Userprofile

Gets information about the current user. Creates a new user if no user with the email exists.

### Example Usage

```typescript
import { EventurasSDK } from "eventuras-sdk-v2";

const eventurasSDK = new EventurasSDK({
  bearer: process.env["EVENTURASSDK_BEARER"] ?? "",
});

async function run() {
  const result = await eventurasSDK.userProfile.getV3Userprofile({});

  // Handle the result
  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { EventurasSDKCore } from "eventuras-sdk-v2/core.js";
import { userProfileGetV3Userprofile } from "eventuras-sdk-v2/funcs/userProfileGetV3Userprofile.js";

// Use `EventurasSDKCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const eventurasSDK = new EventurasSDKCore({
  bearer: process.env["EVENTURASSDK_BEARER"] ?? "",
});

async function run() {
  const res = await userProfileGetV3Userprofile(eventurasSDK, {});

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
| `request`                                                                                                                                                                      | [operations.GetV3UserprofileRequest](../../models/operations/getv3userprofilerequest.md)                                                                                       | :heavy_check_mark:                                                                                                                                                             | The request object to use for the request.                                                                                                                                     |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[operations.GetV3UserprofileResponse](../../models/operations/getv3userprofileresponse.md)\>**

### Errors

| Error Type      | Status Code     | Content Type    |
| --------------- | --------------- | --------------- |
| errors.APIError | 4XX, 5XX        | \*/\*           |

## putV3Userprofile

### Example Usage

```typescript
import { EventurasSDK } from "eventuras-sdk-v2";

const eventurasSDK = new EventurasSDK({
  bearer: process.env["EVENTURASSDK_BEARER"] ?? "",
});

async function run() {
  const result = await eventurasSDK.userProfile.putV3Userprofile({});

  // Handle the result
  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { EventurasSDKCore } from "eventuras-sdk-v2/core.js";
import { userProfilePutV3Userprofile } from "eventuras-sdk-v2/funcs/userProfilePutV3Userprofile.js";

// Use `EventurasSDKCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const eventurasSDK = new EventurasSDKCore({
  bearer: process.env["EVENTURASSDK_BEARER"] ?? "",
});

async function run() {
  const res = await userProfilePutV3Userprofile(eventurasSDK, {});

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
| `request`                                                                                                                                                                      | [operations.PutV3UserprofileRequest](../../models/operations/putv3userprofilerequest.md)                                                                                       | :heavy_check_mark:                                                                                                                                                             | The request object to use for the request.                                                                                                                                     |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[operations.PutV3UserprofileResponse](../../models/operations/putv3userprofileresponse.md)\>**

### Errors

| Error Type      | Status Code     | Content Type    |
| --------------- | --------------- | --------------- |
| errors.APIError | 4XX, 5XX        | \*/\*           |