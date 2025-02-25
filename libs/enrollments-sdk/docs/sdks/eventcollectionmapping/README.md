# EventCollectionMapping
(*eventCollectionMapping*)

## Overview

### Available Operations

* [putV3EventsEventIdCollectionsCollectionId](#putv3eventseventidcollectionscollectionid)
* [deleteV3EventsEventIdCollectionsCollectionId](#deletev3eventseventidcollectionscollectionid)

## putV3EventsEventIdCollectionsCollectionId

### Example Usage

```typescript
import { EnrollmentsSDK } from "enrollments-sdk";

const enrollmentsSDK = new EnrollmentsSDK({
  bearer: process.env["ENROLLMENTSSDK_BEARER"] ?? "",
});

async function run() {
  await enrollmentsSDK.eventCollectionMapping.putV3EventsEventIdCollectionsCollectionId({
    eventId: 509256,
    collectionId: 700752,
  });


}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { EnrollmentsSDKCore } from "enrollments-sdk/core.js";
import { eventCollectionMappingPutV3EventsEventIdCollectionsCollectionId } from "enrollments-sdk/funcs/eventCollectionMappingPutV3EventsEventIdCollectionsCollectionId.js";

// Use `EnrollmentsSDKCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const enrollmentsSDK = new EnrollmentsSDKCore({
  bearer: process.env["ENROLLMENTSSDK_BEARER"] ?? "",
});

async function run() {
  const res = await eventCollectionMappingPutV3EventsEventIdCollectionsCollectionId(enrollmentsSDK, {
    eventId: 509256,
    collectionId: 700752,
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
| `request`                                                                                                                                                                      | [operations.PutV3EventsEventIdCollectionsCollectionIdRequest](../../models/operations/putv3eventseventidcollectionscollectionidrequest.md)                                     | :heavy_check_mark:                                                                                                                                                             | The request object to use for the request.                                                                                                                                     |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<void\>**

### Errors

| Error Type      | Status Code     | Content Type    |
| --------------- | --------------- | --------------- |
| errors.APIError | 4XX, 5XX        | \*/\*           |

## deleteV3EventsEventIdCollectionsCollectionId

### Example Usage

```typescript
import { EnrollmentsSDK } from "enrollments-sdk";

const enrollmentsSDK = new EnrollmentsSDK({
  bearer: process.env["ENROLLMENTSSDK_BEARER"] ?? "",
});

async function run() {
  await enrollmentsSDK.eventCollectionMapping.deleteV3EventsEventIdCollectionsCollectionId({
    eventId: 322812,
    collectionId: 365307,
  });


}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { EnrollmentsSDKCore } from "enrollments-sdk/core.js";
import { eventCollectionMappingDeleteV3EventsEventIdCollectionsCollectionId } from "enrollments-sdk/funcs/eventCollectionMappingDeleteV3EventsEventIdCollectionsCollectionId.js";

// Use `EnrollmentsSDKCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const enrollmentsSDK = new EnrollmentsSDKCore({
  bearer: process.env["ENROLLMENTSSDK_BEARER"] ?? "",
});

async function run() {
  const res = await eventCollectionMappingDeleteV3EventsEventIdCollectionsCollectionId(enrollmentsSDK, {
    eventId: 322812,
    collectionId: 365307,
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
| `request`                                                                                                                                                                      | [operations.DeleteV3EventsEventIdCollectionsCollectionIdRequest](../../models/operations/deletev3eventseventidcollectionscollectionidrequest.md)                               | :heavy_check_mark:                                                                                                                                                             | The request object to use for the request.                                                                                                                                     |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<void\>**

### Errors

| Error Type      | Status Code     | Content Type    |
| --------------- | --------------- | --------------- |
| errors.APIError | 4XX, 5XX        | \*/\*           |