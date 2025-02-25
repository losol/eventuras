/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import * as z from "zod";
import { remap as remap$ } from "../../lib/primitives.js";
import { safeParse } from "../../lib/schemas.js";
import { Result as SafeParseResult } from "../../types/fp.js";
import * as components from "../components/index.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";

export type GetV3OrganizationsRequest = {
  /**
   * Optional organization Id. Will be required in API version 4.
   */
  eventurasOrgId?: number | undefined;
};

export type GetV3OrganizationsResponse =
  | string
  | Array<components.OrganizationDto>
  | Array<components.OrganizationDto>;

/** @internal */
export const GetV3OrganizationsRequest$inboundSchema: z.ZodType<
  GetV3OrganizationsRequest,
  z.ZodTypeDef,
  unknown
> = z.object({
  "Eventuras-Org-Id": z.number().int().optional(),
}).transform((v) => {
  return remap$(v, {
    "Eventuras-Org-Id": "eventurasOrgId",
  });
});

/** @internal */
export type GetV3OrganizationsRequest$Outbound = {
  "Eventuras-Org-Id"?: number | undefined;
};

/** @internal */
export const GetV3OrganizationsRequest$outboundSchema: z.ZodType<
  GetV3OrganizationsRequest$Outbound,
  z.ZodTypeDef,
  GetV3OrganizationsRequest
> = z.object({
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
export namespace GetV3OrganizationsRequest$ {
  /** @deprecated use `GetV3OrganizationsRequest$inboundSchema` instead. */
  export const inboundSchema = GetV3OrganizationsRequest$inboundSchema;
  /** @deprecated use `GetV3OrganizationsRequest$outboundSchema` instead. */
  export const outboundSchema = GetV3OrganizationsRequest$outboundSchema;
  /** @deprecated use `GetV3OrganizationsRequest$Outbound` instead. */
  export type Outbound = GetV3OrganizationsRequest$Outbound;
}

export function getV3OrganizationsRequestToJSON(
  getV3OrganizationsRequest: GetV3OrganizationsRequest,
): string {
  return JSON.stringify(
    GetV3OrganizationsRequest$outboundSchema.parse(getV3OrganizationsRequest),
  );
}

export function getV3OrganizationsRequestFromJSON(
  jsonString: string,
): SafeParseResult<GetV3OrganizationsRequest, SDKValidationError> {
  return safeParse(
    jsonString,
    (x) => GetV3OrganizationsRequest$inboundSchema.parse(JSON.parse(x)),
    `Failed to parse 'GetV3OrganizationsRequest' from JSON`,
  );
}

/** @internal */
export const GetV3OrganizationsResponse$inboundSchema: z.ZodType<
  GetV3OrganizationsResponse,
  z.ZodTypeDef,
  unknown
> = z.union([
  z.string(),
  z.array(components.OrganizationDto$inboundSchema),
  z.array(components.OrganizationDto$inboundSchema),
]);

/** @internal */
export type GetV3OrganizationsResponse$Outbound =
  | string
  | Array<components.OrganizationDto$Outbound>
  | Array<components.OrganizationDto$Outbound>;

/** @internal */
export const GetV3OrganizationsResponse$outboundSchema: z.ZodType<
  GetV3OrganizationsResponse$Outbound,
  z.ZodTypeDef,
  GetV3OrganizationsResponse
> = z.union([
  z.string(),
  z.array(components.OrganizationDto$outboundSchema),
  z.array(components.OrganizationDto$outboundSchema),
]);

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace GetV3OrganizationsResponse$ {
  /** @deprecated use `GetV3OrganizationsResponse$inboundSchema` instead. */
  export const inboundSchema = GetV3OrganizationsResponse$inboundSchema;
  /** @deprecated use `GetV3OrganizationsResponse$outboundSchema` instead. */
  export const outboundSchema = GetV3OrganizationsResponse$outboundSchema;
  /** @deprecated use `GetV3OrganizationsResponse$Outbound` instead. */
  export type Outbound = GetV3OrganizationsResponse$Outbound;
}

export function getV3OrganizationsResponseToJSON(
  getV3OrganizationsResponse: GetV3OrganizationsResponse,
): string {
  return JSON.stringify(
    GetV3OrganizationsResponse$outboundSchema.parse(getV3OrganizationsResponse),
  );
}

export function getV3OrganizationsResponseFromJSON(
  jsonString: string,
): SafeParseResult<GetV3OrganizationsResponse, SDKValidationError> {
  return safeParse(
    jsonString,
    (x) => GetV3OrganizationsResponse$inboundSchema.parse(JSON.parse(x)),
    `Failed to parse 'GetV3OrganizationsResponse' from JSON`,
  );
}
