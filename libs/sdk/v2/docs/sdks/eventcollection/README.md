# EventCollection
(*eventCollection*)

## Overview

### Available Operations

* [getV3Eventcollections](#getv3eventcollections)
* [postV3Eventcollections](#postv3eventcollections)
* [getV3EventcollectionsId](#getv3eventcollectionsid)
* [putV3EventcollectionsId](#putv3eventcollectionsid)
* [deleteV3EventcollectionsId](#deletev3eventcollectionsid)

## getV3Eventcollections

### Example Usage

```typescript
import { EventurasSDK } from "eventuras-sdk-v2";

const eventurasSDK = new EventurasSDK({
  bearer: process.env["EVENTURASSDK_BEARER"] ?? "",
});

async function run() {
  const result = await eventurasSDK.eventCollection.getV3Eventcollections({});

  // Handle the result
  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { EventurasSDKCore } from "eventuras-sdk-v2/core.js";
import { eventCollectionGetV3Eventcollections } from "eventuras-sdk-v2/funcs/eventCollectionGetV3Eventcollections.js";

// Use `EventurasSDKCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const eventurasSDK = new EventurasSDKCore({
  bearer: process.env["EVENTURASSDK_BEARER"] ?? "",
});

async function run() {
  const res = await eventCollectionGetV3Eventcollections(eventurasSDK, {});

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
| `request`                                                                                                                                                                      | [operations.GetV3EventcollectionsRequest](../../models/operations/getv3eventcollectionsrequest.md)                                                                             | :heavy_check_mark:                                                                                                                                                             | The request object to use for the request.                                                                                                                                     |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[operations.GetV3EventcollectionsResponse](../../models/operations/getv3eventcollectionsresponse.md)\>**

### Errors

| Error Type      | Status Code     | Content Type    |
| --------------- | --------------- | --------------- |
| errors.APIError | 4XX, 5XX        | \*/\*           |

## postV3Eventcollections

### Example Usage

```typescript
import { EventurasSDK } from "eventuras-sdk-v2";

const eventurasSDK = new EventurasSDK({
  bearer: process.env["EVENTURASSDK_BEARER"] ?? "",
});

async function run() {
  const result = await eventurasSDK.eventCollection.postV3Eventcollections({});

  // Handle the result
  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { EventurasSDKCore } from "eventuras-sdk-v2/core.js";
import { eventCollectionPostV3Eventcollections } from "eventuras-sdk-v2/funcs/eventCollectionPostV3Eventcollections.js";

// Use `EventurasSDKCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const eventurasSDK = new EventurasSDKCore({
  bearer: process.env["EVENTURASSDK_BEARER"] ?? "",
});

async function run() {
  const res = await eventCollectionPostV3Eventcollections(eventurasSDK, {});

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
| `request`                                                                                                                                                                      | [operations.PostV3EventcollectionsRequest](../../models/operations/postv3eventcollectionsrequest.md)                                                                           | :heavy_check_mark:                                                                                                                                                             | The request object to use for the request.                                                                                                                                     |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[operations.PostV3EventcollectionsResponse](../../models/operations/postv3eventcollectionsresponse.md)\>**

### Errors

| Error Type      | Status Code     | Content Type    |
| --------------- | --------------- | --------------- |
| errors.APIError | 4XX, 5XX        | \*/\*           |

## getV3EventcollectionsId

### Example Usage

```typescript
import { EventurasSDK } from "eventuras-sdk-v2";

const eventurasSDK = new EventurasSDK({
  bearer: process.env["EVENTURASSDK_BEARER"] ?? "",
});

async function run() {
  const result = await eventurasSDK.eventCollection.getV3EventcollectionsId({
    id: 163916,
  });

  // Handle the result
  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { EventurasSDKCore } from "eventuras-sdk-v2/core.js";
import { eventCollectionGetV3EventcollectionsId } from "eventuras-sdk-v2/funcs/eventCollectionGetV3EventcollectionsId.js";

// Use `EventurasSDKCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const eventurasSDK = new EventurasSDKCore({
  bearer: process.env["EVENTURASSDK_BEARER"] ?? "",
});

async function run() {
  const res = await eventCollectionGetV3EventcollectionsId(eventurasSDK, {
    id: 163916,
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
| `request`                                                                                                                                                                      | [operations.GetV3EventcollectionsIdRequest](../../models/operations/getv3eventcollectionsidrequest.md)                                                                         | :heavy_check_mark:                                                                                                                                                             | The request object to use for the request.                                                                                                                                     |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[operations.GetV3EventcollectionsIdResponse](../../models/operations/getv3eventcollectionsidresponse.md)\>**

### Errors

| Error Type      | Status Code     | Content Type    |
| --------------- | --------------- | --------------- |
| errors.APIError | 4XX, 5XX        | \*/\*           |

## putV3EventcollectionsId

### Example Usage

```typescript
import { EventurasSDK } from "eventuras-sdk-v2";

const eventurasSDK = new EventurasSDK({
  bearer: process.env["EVENTURASSDK_BEARER"] ?? "",
});

async function run() {
  const result = await eventurasSDK.eventCollection.putV3EventcollectionsId({
    id: 671798,
  });

  // Handle the result
  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { EventurasSDKCore } from "eventuras-sdk-v2/core.js";
import { eventCollectionPutV3EventcollectionsId } from "eventuras-sdk-v2/funcs/eventCollectionPutV3EventcollectionsId.js";

// Use `EventurasSDKCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const eventurasSDK = new EventurasSDKCore({
  bearer: process.env["EVENTURASSDK_BEARER"] ?? "",
});

async function run() {
  const res = await eventCollectionPutV3EventcollectionsId(eventurasSDK, {
    id: 671798,
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
| `request`                                                                                                                                                                      | [operations.PutV3EventcollectionsIdRequest](../../models/operations/putv3eventcollectionsidrequest.md)                                                                         | :heavy_check_mark:                                                                                                                                                             | The request object to use for the request.                                                                                                                                     |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[operations.PutV3EventcollectionsIdResponse](../../models/operations/putv3eventcollectionsidresponse.md)\>**

### Errors

| Error Type      | Status Code     | Content Type    |
| --------------- | --------------- | --------------- |
| errors.APIError | 4XX, 5XX        | \*/\*           |

## deleteV3EventcollectionsId

### Example Usage

```typescript
import { EventurasSDK } from "eventuras-sdk-v2";

const eventurasSDK = new EventurasSDK({
  bearer: process.env["EVENTURASSDK_BEARER"] ?? "",
});

async function run() {
  await eventurasSDK.eventCollection.deleteV3EventcollectionsId({
    id: 774595,
  });


}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { EventurasSDKCore } from "eventuras-sdk-v2/core.js";
import { eventCollectionDeleteV3EventcollectionsId } from "eventuras-sdk-v2/funcs/eventCollectionDeleteV3EventcollectionsId.js";

// Use `EventurasSDKCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const eventurasSDK = new EventurasSDKCore({
  bearer: process.env["EVENTURASSDK_BEARER"] ?? "",
});

async function run() {
  const res = await eventCollectionDeleteV3EventcollectionsId(eventurasSDK, {
    id: 774595,
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
| `request`                                                                                                                                                                      | [operations.DeleteV3EventcollectionsIdRequest](../../models/operations/deletev3eventcollectionsidrequest.md)                                                                   | :heavy_check_mark:                                                                                                                                                             | The request object to use for the request.                                                                                                                                     |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<void\>**

### Errors

| Error Type      | Status Code     | Content Type    |
| --------------- | --------------- | --------------- |
| errors.APIError | 4XX, 5XX        | \*/\*           |