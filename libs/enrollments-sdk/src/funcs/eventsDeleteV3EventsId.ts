/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import * as z from "zod";
import { EnrollmentsSDKCore } from "../core.js";
import { encodeSimple } from "../lib/encodings.js";
import * as M from "../lib/matchers.js";
import { compactMap } from "../lib/primitives.js";
import { safeParse } from "../lib/schemas.js";
import { RequestOptions } from "../lib/sdks.js";
import { extractSecurity, resolveGlobalSecurity } from "../lib/security.js";
import { pathToFunc } from "../lib/url.js";
import { APIError } from "../models/errors/apierror.js";
import {
  ConnectionError,
  InvalidRequestError,
  RequestAbortedError,
  RequestTimeoutError,
  UnexpectedClientError,
} from "../models/errors/httpclienterrors.js";
import { SDKValidationError } from "../models/errors/sdkvalidationerror.js";
import * as operations from "../models/operations/index.js";
import { APICall, APIPromise } from "../types/async.js";
import { Result } from "../types/fp.js";

/**
 * Deletes an event by ID.
 */
export function eventsDeleteV3EventsId(
  client: EnrollmentsSDKCore,
  request: operations.DeleteV3EventsIdRequest,
  options?: RequestOptions,
): APIPromise<
  Result<
    void,
    | APIError
    | SDKValidationError
    | UnexpectedClientError
    | InvalidRequestError
    | RequestAbortedError
    | RequestTimeoutError
    | ConnectionError
  >
> {
  return new APIPromise($do(
    client,
    request,
    options,
  ));
}

async function $do(
  client: EnrollmentsSDKCore,
  request: operations.DeleteV3EventsIdRequest,
  options?: RequestOptions,
): Promise<
  [
    Result<
      void,
      | APIError
      | SDKValidationError
      | UnexpectedClientError
      | InvalidRequestError
      | RequestAbortedError
      | RequestTimeoutError
      | ConnectionError
    >,
    APICall,
  ]
> {
  const parsed = safeParse(
    request,
    (value) => operations.DeleteV3EventsIdRequest$outboundSchema.parse(value),
    "Input validation failed",
  );
  if (!parsed.ok) {
    return [parsed, { status: "invalid" }];
  }
  const payload = parsed.value;
  const body = null;

  const pathParams = {
    id: encodeSimple("id", payload.id, {
      explode: false,
      charEncoding: "percent",
    }),
  };

  const path = pathToFunc("/v3/events/{id}")(pathParams);

  const headers = new Headers(compactMap({
    Accept: "*/*",
    "Eventuras-Org-Id": encodeSimple(
      "Eventuras-Org-Id",
      payload["Eventuras-Org-Id"],
      { explode: false, charEncoding: "none" },
    ),
  }));

  const secConfig = await extractSecurity(client._options.bearer);
  const securityInput = secConfig == null ? {} : { bearer: secConfig };
  const requestSecurity = resolveGlobalSecurity(securityInput);

  const context = {
    baseURL: options?.serverURL ?? client._baseURL ?? "",
    operationID: "delete_/v3/events/{id}",
    oAuth2Scopes: [],

    resolvedSecurity: requestSecurity,

    securitySource: client._options.bearer,
    retryConfig: options?.retries
      || client._options.retryConfig
      || { strategy: "none" },
    retryCodes: options?.retryCodes || ["429", "500", "502", "503", "504"],
  };

  const requestRes = client._createRequest(context, {
    security: requestSecurity,
    method: "DELETE",
    baseURL: options?.serverURL,
    path: path,
    headers: headers,
    body: body,
    timeoutMs: options?.timeoutMs || client._options.timeoutMs || -1,
  }, options);
  if (!requestRes.ok) {
    return [requestRes, { status: "invalid" }];
  }
  const req = requestRes.value;

  const doResult = await client._do(req, {
    context,
    errorCodes: ["4XX", "5XX"],
    retryConfig: context.retryConfig,
    retryCodes: context.retryCodes,
  });
  if (!doResult.ok) {
    return [doResult, { status: "request-error", request: req }];
  }
  const response = doResult.value;

  const [result] = await M.match<
    void,
    | APIError
    | SDKValidationError
    | UnexpectedClientError
    | InvalidRequestError
    | RequestAbortedError
    | RequestTimeoutError
    | ConnectionError
  >(
    M.nil(200, z.void()),
    M.fail("4XX"),
    M.fail("5XX"),
  )(response);
  if (!result.ok) {
    return [result, { status: "complete", request: req, response }];
  }

  return [result, { status: "complete", request: req, response }];
}
