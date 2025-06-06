/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import * as z from "zod";
import { remap as remap$ } from "../../lib/primitives.js";
import { safeParse } from "../../lib/schemas.js";
import { Result as SafeParseResult } from "../../types/fp.js";
import * as components from "../components/index.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";

export type GetV3OnlinecoursesIdRequest = {
  id: number;
  /**
   * Optional organization Id. Will be required in API version 4.
   */
  eventurasOrgId?: number | undefined;
};

export type GetV3OnlinecoursesIdResponse = components.OnlineCourseDto | string;

/** @internal */
export const GetV3OnlinecoursesIdRequest$inboundSchema: z.ZodType<
  GetV3OnlinecoursesIdRequest,
  z.ZodTypeDef,
  unknown
> = z.object({
  id: z.number().int(),
  "Eventuras-Org-Id": z.number().int().optional(),
}).transform((v) => {
  return remap$(v, {
    "Eventuras-Org-Id": "eventurasOrgId",
  });
});

/** @internal */
export type GetV3OnlinecoursesIdRequest$Outbound = {
  id: number;
  "Eventuras-Org-Id"?: number | undefined;
};

/** @internal */
export const GetV3OnlinecoursesIdRequest$outboundSchema: z.ZodType<
  GetV3OnlinecoursesIdRequest$Outbound,
  z.ZodTypeDef,
  GetV3OnlinecoursesIdRequest
> = z.object({
  id: z.number().int(),
  eventurasOrgId: z.number().int().optional(),
}).transform((v) => {
  return remap$(v, {
    eventurasOrgId: "Eventuras-Org-Id",
  });
});

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace GetV3OnlinecoursesIdRequest$ {
  /** @deprecated use `GetV3OnlinecoursesIdRequest$inboundSchema` instead. */
  export const inboundSchema = GetV3OnlinecoursesIdRequest$inboundSchema;
  /** @deprecated use `GetV3OnlinecoursesIdRequest$outboundSchema` instead. */
  export const outboundSchema = GetV3OnlinecoursesIdRequest$outboundSchema;
  /** @deprecated use `GetV3OnlinecoursesIdRequest$Outbound` instead. */
  export type Outbound = GetV3OnlinecoursesIdRequest$Outbound;
}

export function getV3OnlinecoursesIdRequestToJSON(
  getV3OnlinecoursesIdRequest: GetV3OnlinecoursesIdRequest,
): string {
  return JSON.stringify(
    GetV3OnlinecoursesIdRequest$outboundSchema.parse(
      getV3OnlinecoursesIdRequest,
    ),
  );
}

export function getV3OnlinecoursesIdRequestFromJSON(
  jsonString: string,
): SafeParseResult<GetV3OnlinecoursesIdRequest, SDKValidationError> {
  return safeParse(
    jsonString,
    (x) => GetV3OnlinecoursesIdRequest$inboundSchema.parse(JSON.parse(x)),
    `Failed to parse 'GetV3OnlinecoursesIdRequest' from JSON`,
  );
}

/** @internal */
export const GetV3OnlinecoursesIdResponse$inboundSchema: z.ZodType<
  GetV3OnlinecoursesIdResponse,
  z.ZodTypeDef,
  unknown
> = z.union([components.OnlineCourseDto$inboundSchema, z.string()]);

/** @internal */
export type GetV3OnlinecoursesIdResponse$Outbound =
  | components.OnlineCourseDto$Outbound
  | string;

/** @internal */
export const GetV3OnlinecoursesIdResponse$outboundSchema: z.ZodType<
  GetV3OnlinecoursesIdResponse$Outbound,
  z.ZodTypeDef,
  GetV3OnlinecoursesIdResponse
> = z.union([components.OnlineCourseDto$outboundSchema, z.string()]);

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace GetV3OnlinecoursesIdResponse$ {
  /** @deprecated use `GetV3OnlinecoursesIdResponse$inboundSchema` instead. */
  export const inboundSchema = GetV3OnlinecoursesIdResponse$inboundSchema;
  /** @deprecated use `GetV3OnlinecoursesIdResponse$outboundSchema` instead. */
  export const outboundSchema = GetV3OnlinecoursesIdResponse$outboundSchema;
  /** @deprecated use `GetV3OnlinecoursesIdResponse$Outbound` instead. */
  export type Outbound = GetV3OnlinecoursesIdResponse$Outbound;
}

export function getV3OnlinecoursesIdResponseToJSON(
  getV3OnlinecoursesIdResponse: GetV3OnlinecoursesIdResponse,
): string {
  return JSON.stringify(
    GetV3OnlinecoursesIdResponse$outboundSchema.parse(
      getV3OnlinecoursesIdResponse,
    ),
  );
}

export function getV3OnlinecoursesIdResponseFromJSON(
  jsonString: string,
): SafeParseResult<GetV3OnlinecoursesIdResponse, SDKValidationError> {
  return safeParse(
    jsonString,
    (x) => GetV3OnlinecoursesIdResponse$inboundSchema.parse(JSON.parse(x)),
    `Failed to parse 'GetV3OnlinecoursesIdResponse' from JSON`,
  );
}
