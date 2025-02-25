# EventStatistics
(*eventStatistics*)

## Overview

### Available Operations

* [getV3EventsEventIdStatistics](#getv3eventseventidstatistics) - Event statistics

## getV3EventsEventIdStatistics

Returns a summary of the registrations for the event.

### Example Usage

```typescript
import { EventurasSDK } from "eventuras-sdk-v2";

const eventurasSDK = new EventurasSDK({
  bearer: process.env["EVENTURASSDK_BEARER"] ?? "",
});

async function run() {
  const result = await eventurasSDK.eventStatistics.getV3EventsEventIdStatistics({
    eventId: 574255,
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
import { eventStatisticsGetV3EventsEventIdStatistics } from "eventuras-sdk-v2/funcs/eventStatisticsGetV3EventsEventIdStatistics.js";

// Use `EventurasSDKCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const eventurasSDK = new EventurasSDKCore({
  bearer: process.env["EVENTURASSDK_BEARER"] ?? "",
});

async function run() {
  const res = await eventStatisticsGetV3EventsEventIdStatistics(eventurasSDK, {
    eventId: 574255,
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
| `request`                                                                                                                                                                      | [operations.GetV3EventsEventIdStatisticsRequest](../../models/operations/getv3eventseventidstatisticsrequest.md)                                                               | :heavy_check_mark:                                                                                                                                                             | The request object to use for the request.                                                                                                                                     |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[operations.GetV3EventsEventIdStatisticsResponse](../../models/operations/getv3eventseventidstatisticsresponse.md)\>**

### Errors

| Error Type      | Status Code     | Content Type    |
| --------------- | --------------- | --------------- |
| errors.APIError | 4XX, 5XX        | \*/\*           |