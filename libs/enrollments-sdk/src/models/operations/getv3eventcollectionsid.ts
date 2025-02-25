/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import * as z from "zod";
import { remap as remap$ } from "../../lib/primitives.js";
import { safeParse } from "../../lib/schemas.js";
import { Result as SafeParseResult } from "../../types/fp.js";
import * as components from "../components/index.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";

export type GetV3EventcollectionsIdRequest = {
  id: number;
  /**
   * Optional organization Id. Will be required in API version 4.
   */
  eventurasOrgId?: number | undefined;
};

export type GetV3EventcollectionsIdResponse =
  | components.EventCollectionDto
  | string;

/** @internal */
export const GetV3EventcollectionsIdRequest$inboundSchema: z.ZodType<
  GetV3EventcollectionsIdRequest,
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
export type GetV3EventcollectionsIdRequest$Outbound = {
  id: number;
  "Eventuras-Org-Id"?: number | undefined;
};

/** @internal */
export const GetV3EventcollectionsIdRequest$outboundSchema: z.ZodType<
  GetV3EventcollectionsIdRequest$Outbound,
  z.ZodTypeDef,
  GetV3EventcollectionsIdRequest
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
export namespace GetV3EventcollectionsIdRequest$ {
  /** @deprecated use `GetV3EventcollectionsIdRequest$inboundSchema` instead. */
  export const inboundSchema = GetV3EventcollectionsIdRequest$inboundSchema;
  /** @deprecated use `GetV3EventcollectionsIdRequest$outboundSchema` instead. */
  export const outboundSchema = GetV3EventcollectionsIdRequest$outboundSchema;
  /** @deprecated use `GetV3EventcollectionsIdRequest$Outbound` instead. */
  export type Outbound = GetV3EventcollectionsIdRequest$Outbound;
}

export function getV3EventcollectionsIdRequestToJSON(
  getV3EventcollectionsIdRequest: GetV3EventcollectionsIdRequest,
): string {
  return JSON.stringify(
    GetV3EventcollectionsIdRequest$outboundSchema.parse(
      getV3EventcollectionsIdRequest,
    ),
  );
}

export function getV3EventcollectionsIdRequestFromJSON(
  jsonString: string,
): SafeParseResult<GetV3EventcollectionsIdRequest, SDKValidationError> {
  return safeParse(
    jsonString,
    (x) => GetV3EventcollectionsIdRequest$inboundSchema.parse(JSON.parse(x)),
    `Failed to parse 'GetV3EventcollectionsIdRequest' from JSON`,
  );
}

/** @internal */
export const GetV3EventcollectionsIdResponse$inboundSchema: z.ZodType<
  GetV3EventcollectionsIdResponse,
  z.ZodTypeDef,
  unknown
> = z.union([components.EventCollectionDto$inboundSchema, z.string()]);

/** @internal */
export type GetV3EventcollectionsIdResponse$Outbound =
  | components.EventCollectionDto$Outbound
  | string;

/** @internal */
export const GetV3EventcollectionsIdResponse$outboundSchema: z.ZodType<
  GetV3EventcollectionsIdResponse$Outbound,
  z.ZodTypeDef,
  GetV3EventcollectionsIdResponse
> = z.union([components.EventCollectionDto$outboundSchema, z.string()]);

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace GetV3EventcollectionsIdResponse$ {
  /** @deprecated use `GetV3EventcollectionsIdResponse$inboundSchema` instead. */
  export const inboundSchema = GetV3EventcollectionsIdResponse$inboundSchema;
  /** @deprecated use `GetV3EventcollectionsIdResponse$outboundSchema` instead. */
  export const outboundSchema = GetV3EventcollectionsIdResponse$outboundSchema;
  /** @deprecated use `GetV3EventcollectionsIdResponse$Outbound` instead. */
  export type Outbound = GetV3EventcollectionsIdResponse$Outbound;
}

export function getV3EventcollectionsIdResponseToJSON(
  getV3EventcollectionsIdResponse: GetV3EventcollectionsIdResponse,
): string {
  return JSON.stringify(
    GetV3EventcollectionsIdResponse$outboundSchema.parse(
      getV3EventcollectionsIdResponse,
    ),
  );
}

export function getV3EventcollectionsIdResponseFromJSON(
  jsonString: string,
): SafeParseResult<GetV3EventcollectionsIdResponse, SDKValidationError> {
  return safeParse(
    jsonString,
    (x) => GetV3EventcollectionsIdResponse$inboundSchema.parse(JSON.parse(x)),
    `Failed to parse 'GetV3EventcollectionsIdResponse' from JSON`,
  );
}
