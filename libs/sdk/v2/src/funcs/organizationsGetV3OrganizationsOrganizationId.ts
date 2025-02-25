/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import { EventurasSDKCore } from "../core.js";
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
import { Result } from "../types/fp.js";

export enum GetV3OrganizationsOrganizationIdAcceptEnum {
  applicationJson = "application/json",
  textJson = "text/json",
  textPlain = "text/plain",
}

export async function organizationsGetV3OrganizationsOrganizationId(
  client: EventurasSDKCore,
  request: operations.GetV3OrganizationsOrganizationIdRequest,
  options?: RequestOptions & {
    acceptHeaderOverride?: GetV3OrganizationsOrganizationIdAcceptEnum;
  },
): Promise<
  Result<
    operations.GetV3OrganizationsOrganizationIdResponse,
    | APIError
    | SDKValidationError
    | UnexpectedClientError
    | InvalidRequestError
    | RequestAbortedError
    | RequestTimeoutError
    | ConnectionError
  >
> {
  const parsed = safeParse(
    request,
    (value) =>
      operations.GetV3OrganizationsOrganizationIdRequest$outboundSchema.parse(
        value,
      ),
    "Input validation failed",
  );
  if (!parsed.ok) {
    return parsed;
  }
  const payload = parsed.value;
  const body = null;

  const pathParams = {
    organizationId: encodeSimple("organizationId", payload.organizationId, {
      explode: false,
      charEncoding: "percent",
    }),
  };

  const path = pathToFunc("/v3/organizations/{organizationId}")(pathParams);

  const headers = new Headers(compactMap({
    Accept: options?.acceptHeaderOverride
      || "application/json;q=1, text/json;q=0.7, text/plain;q=0",
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
    operationID: "get_/v3/organizations/{organizationId}",
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
    method: "GET",
    baseURL: options?.serverURL,
    path: path,
    headers: headers,
    body: body,
    timeoutMs: options?.timeoutMs || client._options.timeoutMs || -1,
  }, options);
  if (!requestRes.ok) {
    return requestRes;
  }
  const req = requestRes.value;

  const doResult = await client._do(req, {
    context,
    errorCodes: ["4XX", "5XX"],
    retryConfig: context.retryConfig,
    retryCodes: context.retryCodes,
  });
  if (!doResult.ok) {
    return doResult;
  }
  const response = doResult.value;

  const [result] = await M.match<
    operations.GetV3OrganizationsOrganizationIdResponse,
    | APIError
    | SDKValidationError
    | UnexpectedClientError
    | InvalidRequestError
    | RequestAbortedError
    | RequestTimeoutError
    | ConnectionError
  >(
    M.text(
      200,
      operations.GetV3OrganizationsOrganizationIdResponse$inboundSchema,
    ),
    M.json(
      200,
      operations.GetV3OrganizationsOrganizationIdResponse$inboundSchema,
    ),
    M.json(
      200,
      operations.GetV3OrganizationsOrganizationIdResponse$inboundSchema,
      { ctype: "text/json" },
    ),
    M.fail("4XX"),
    M.fail("5XX"),
  )(response);
  if (!result.ok) {
    return result;
  }

  return result;
}
