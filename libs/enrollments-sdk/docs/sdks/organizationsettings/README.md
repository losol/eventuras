# OrganizationSettings
(*organizationSettings*)

## Overview

### Available Operations

* [getV3OrganizationsOrganizationIdSettings](#getv3organizationsorganizationidsettings)
* [putV3OrganizationsOrganizationIdSettings](#putv3organizationsorganizationidsettings)
* [postV3OrganizationsOrganizationIdSettings](#postv3organizationsorganizationidsettings)

## getV3OrganizationsOrganizationIdSettings

### Example Usage

```typescript
import { EnrollmentsSDK } from "enrollments-sdk";

const enrollmentsSDK = new EnrollmentsSDK({
  bearer: process.env["ENROLLMENTSSDK_BEARER"] ?? "",
});

async function run() {
  const result = await enrollmentsSDK.organizationSettings.getV3OrganizationsOrganizationIdSettings({
    organizationId: 953243,
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
import { organizationSettingsGetV3OrganizationsOrganizationIdSettings } from "enrollments-sdk/funcs/organizationSettingsGetV3OrganizationsOrganizationIdSettings.js";

// Use `EnrollmentsSDKCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const enrollmentsSDK = new EnrollmentsSDKCore({
  bearer: process.env["ENROLLMENTSSDK_BEARER"] ?? "",
});

async function run() {
  const res = await organizationSettingsGetV3OrganizationsOrganizationIdSettings(enrollmentsSDK, {
    organizationId: 953243,
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
| `request`                                                                                                                                                                      | [operations.GetV3OrganizationsOrganizationIdSettingsRequest](../../models/operations/getv3organizationsorganizationidsettingsrequest.md)                                       | :heavy_check_mark:                                                                                                                                                             | The request object to use for the request.                                                                                                                                     |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[operations.GetV3OrganizationsOrganizationIdSettingsResponse](../../models/operations/getv3organizationsorganizationidsettingsresponse.md)\>**

### Errors

| Error Type      | Status Code     | Content Type    |
| --------------- | --------------- | --------------- |
| errors.APIError | 4XX, 5XX        | \*/\*           |

## putV3OrganizationsOrganizationIdSettings

### Example Usage

```typescript
import { EnrollmentsSDK } from "enrollments-sdk";

const enrollmentsSDK = new EnrollmentsSDK({
  bearer: process.env["ENROLLMENTSSDK_BEARER"] ?? "",
});

async function run() {
  await enrollmentsSDK.organizationSettings.putV3OrganizationsOrganizationIdSettings({
    organizationId: 830600,
  });


}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { EnrollmentsSDKCore } from "enrollments-sdk/core.js";
import { organizationSettingsPutV3OrganizationsOrganizationIdSettings } from "enrollments-sdk/funcs/organizationSettingsPutV3OrganizationsOrganizationIdSettings.js";

// Use `EnrollmentsSDKCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const enrollmentsSDK = new EnrollmentsSDKCore({
  bearer: process.env["ENROLLMENTSSDK_BEARER"] ?? "",
});

async function run() {
  const res = await organizationSettingsPutV3OrganizationsOrganizationIdSettings(enrollmentsSDK, {
    organizationId: 830600,
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
| `request`                                                                                                                                                                      | [operations.PutV3OrganizationsOrganizationIdSettingsRequest](../../models/operations/putv3organizationsorganizationidsettingsrequest.md)                                       | :heavy_check_mark:                                                                                                                                                             | The request object to use for the request.                                                                                                                                     |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<void\>**

### Errors

| Error Type      | Status Code     | Content Type    |
| --------------- | --------------- | --------------- |
| errors.APIError | 4XX, 5XX        | \*/\*           |

## postV3OrganizationsOrganizationIdSettings

### Example Usage

```typescript
import { EnrollmentsSDK } from "enrollments-sdk";

const enrollmentsSDK = new EnrollmentsSDK({
  bearer: process.env["ENROLLMENTSSDK_BEARER"] ?? "",
});

async function run() {
  await enrollmentsSDK.organizationSettings.postV3OrganizationsOrganizationIdSettings({
    organizationId: 695728,
    requestBody: [
      {
        name: "<value>",
      },
      {
        name: "<value>",
      },
      {
        name: "<value>",
      },
    ],
  });


}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { EnrollmentsSDKCore } from "enrollments-sdk/core.js";
import { organizationSettingsPostV3OrganizationsOrganizationIdSettings } from "enrollments-sdk/funcs/organizationSettingsPostV3OrganizationsOrganizationIdSettings.js";

// Use `EnrollmentsSDKCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const enrollmentsSDK = new EnrollmentsSDKCore({
  bearer: process.env["ENROLLMENTSSDK_BEARER"] ?? "",
});

async function run() {
  const res = await organizationSettingsPostV3OrganizationsOrganizationIdSettings(enrollmentsSDK, {
    organizationId: 695728,
    requestBody: [
      {
        name: "<value>",
      },
      {
        name: "<value>",
      },
      {
        name: "<value>",
      },
    ],
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
| `request`                                                                                                                                                                      | [operations.PostV3OrganizationsOrganizationIdSettingsRequest](../../models/operations/postv3organizationsorganizationidsettingsrequest.md)                                     | :heavy_check_mark:                                                                                                                                                             | The request object to use for the request.                                                                                                                                     |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<void\>**

### Errors

| Error Type      | Status Code     | Content Type    |
| --------------- | --------------- | --------------- |
| errors.APIError | 4XX, 5XX        | \*/\*           |