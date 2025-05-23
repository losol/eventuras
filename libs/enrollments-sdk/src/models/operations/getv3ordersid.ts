/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import * as z from "zod";
import { remap as remap$ } from "../../lib/primitives.js";
import { safeParse } from "../../lib/schemas.js";
import { Result as SafeParseResult } from "../../types/fp.js";
import * as components from "../components/index.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";

export type GetV3OrdersIdRequest = {
  id: number;
  includeUser?: boolean | undefined;
  includeRegistration?: boolean | undefined;
  /**
   * Optional organization Id. Will be required in API version 4.
   */
  eventurasOrgId?: number | undefined;
};

export type GetV3OrdersIdResponse = components.OrderDto | string;

/** @internal */
export const GetV3OrdersIdRequest$inboundSchema: z.ZodType<
  GetV3OrdersIdRequest,
  z.ZodTypeDef,
  unknown
> = z.object({
  id: z.number().int(),
  IncludeUser: z.boolean().optional(),
  IncludeRegistration: z.boolean().optional(),
  "Eventuras-Org-Id": z.number().int().optional(),
}).transform((v) => {
  return remap$(v, {
    "IncludeUser": "includeUser",
    "IncludeRegistration": "includeRegistration",
    "Eventuras-Org-Id": "eventurasOrgId",
  });
});

/** @internal */
export type GetV3OrdersIdRequest$Outbound = {
  id: number;
  IncludeUser?: boolean | undefined;
  IncludeRegistration?: boolean | undefined;
  "Eventuras-Org-Id"?: number | undefined;
};

/** @internal */
export const GetV3OrdersIdRequest$outboundSchema: z.ZodType<
  GetV3OrdersIdRequest$Outbound,
  z.ZodTypeDef,
  GetV3OrdersIdRequest
> = z.object({
  id: z.number().int(),
  includeUser: z.boolean().optional(),
  includeRegistration: z.boolean().optional(),
  eventurasOrgId: z.number().int().optional(),
}).transform((v) => {
  return remap$(v, {
    includeUser: "IncludeUser",
    includeRegistration: "IncludeRegistration",
    eventurasOrgId: "Eventuras-Org-Id",
  });
});

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace GetV3OrdersIdRequest$ {
  /** @deprecated use `GetV3OrdersIdRequest$inboundSchema` instead. */
  export const inboundSchema = GetV3OrdersIdRequest$inboundSchema;
  /** @deprecated use `GetV3OrdersIdRequest$outboundSchema` instead. */
  export const outboundSchema = GetV3OrdersIdRequest$outboundSchema;
  /** @deprecated use `GetV3OrdersIdRequest$Outbound` instead. */
  export type Outbound = GetV3OrdersIdRequest$Outbound;
}

export function getV3OrdersIdRequestToJSON(
  getV3OrdersIdRequest: GetV3OrdersIdRequest,
): string {
  return JSON.stringify(
    GetV3OrdersIdRequest$outboundSchema.parse(getV3OrdersIdRequest),
  );
}

export function getV3OrdersIdRequestFromJSON(
  jsonString: string,
): SafeParseResult<GetV3OrdersIdRequest, SDKValidationError> {
  return safeParse(
    jsonString,
    (x) => GetV3OrdersIdRequest$inboundSchema.parse(JSON.parse(x)),
    `Failed to parse 'GetV3OrdersIdRequest' from JSON`,
  );
}

/** @internal */
export const GetV3OrdersIdResponse$inboundSchema: z.ZodType<
  GetV3OrdersIdResponse,
  z.ZodTypeDef,
  unknown
> = z.union([components.OrderDto$inboundSchema, z.string()]);

/** @internal */
export type GetV3OrdersIdResponse$Outbound =
  | components.OrderDto$Outbound
  | string;

/** @internal */
export const GetV3OrdersIdResponse$outboundSchema: z.ZodType<
  GetV3OrdersIdResponse$Outbound,
  z.ZodTypeDef,
  GetV3OrdersIdResponse
> = z.union([components.OrderDto$outboundSchema, z.string()]);

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace GetV3OrdersIdResponse$ {
  /** @deprecated use `GetV3OrdersIdResponse$inboundSchema` instead. */
  export const inboundSchema = GetV3OrdersIdResponse$inboundSchema;
  /** @deprecated use `GetV3OrdersIdResponse$outboundSchema` instead. */
  export const outboundSchema = GetV3OrdersIdResponse$outboundSchema;
  /** @deprecated use `GetV3OrdersIdResponse$Outbound` instead. */
  export type Outbound = GetV3OrdersIdResponse$Outbound;
}

export function getV3OrdersIdResponseToJSON(
  getV3OrdersIdResponse: GetV3OrdersIdResponse,
): string {
  return JSON.stringify(
    GetV3OrdersIdResponse$outboundSchema.parse(getV3OrdersIdResponse),
  );
}

export function getV3OrdersIdResponseFromJSON(
  jsonString: string,
): SafeParseResult<GetV3OrdersIdResponse, SDKValidationError> {
  return safeParse(
    jsonString,
    (x) => GetV3OrdersIdResponse$inboundSchema.parse(JSON.parse(x)),
    `Failed to parse 'GetV3OrdersIdResponse' from JSON`,
  );
}
