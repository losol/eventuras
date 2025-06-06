/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import * as z from "zod";
import { remap as remap$ } from "../../lib/primitives.js";
import { safeParse } from "../../lib/schemas.js";
import { Result as SafeParseResult } from "../../types/fp.js";
import * as components from "../components/index.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";

export type PostV3OrganizationsRequest = {
  /**
   * Optional organization Id. Will be required in API version 4.
   */
  eventurasOrgId?: number | undefined;
  organizationFormDto?: components.OrganizationFormDto | undefined;
};

export type PostV3OrganizationsResponse = components.OrganizationDto | string;

/** @internal */
export const PostV3OrganizationsRequest$inboundSchema: z.ZodType<
  PostV3OrganizationsRequest,
  z.ZodTypeDef,
  unknown
> = z.object({
  "Eventuras-Org-Id": z.number().int().optional(),
  OrganizationFormDto: components.OrganizationFormDto$inboundSchema.optional(),
}).transform((v) => {
  return remap$(v, {
    "Eventuras-Org-Id": "eventurasOrgId",
    "OrganizationFormDto": "organizationFormDto",
  });
});

/** @internal */
export type PostV3OrganizationsRequest$Outbound = {
  "Eventuras-Org-Id"?: number | undefined;
  OrganizationFormDto?: components.OrganizationFormDto$Outbound | undefined;
};

/** @internal */
export const PostV3OrganizationsRequest$outboundSchema: z.ZodType<
  PostV3OrganizationsRequest$Outbound,
  z.ZodTypeDef,
  PostV3OrganizationsRequest
> = z.object({
  eventurasOrgId: z.number().int().optional(),
  organizationFormDto: components.OrganizationFormDto$outboundSchema.optional(),
}).transform((v) => {
  return remap$(v, {
    eventurasOrgId: "Eventuras-Org-Id",
    organizationFormDto: "OrganizationFormDto",
  });
});

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace PostV3OrganizationsRequest$ {
  /** @deprecated use `PostV3OrganizationsRequest$inboundSchema` instead. */
  export const inboundSchema = PostV3OrganizationsRequest$inboundSchema;
  /** @deprecated use `PostV3OrganizationsRequest$outboundSchema` instead. */
  export const outboundSchema = PostV3OrganizationsRequest$outboundSchema;
  /** @deprecated use `PostV3OrganizationsRequest$Outbound` instead. */
  export type Outbound = PostV3OrganizationsRequest$Outbound;
}

export function postV3OrganizationsRequestToJSON(
  postV3OrganizationsRequest: PostV3OrganizationsRequest,
): string {
  return JSON.stringify(
    PostV3OrganizationsRequest$outboundSchema.parse(postV3OrganizationsRequest),
  );
}

export function postV3OrganizationsRequestFromJSON(
  jsonString: string,
): SafeParseResult<PostV3OrganizationsRequest, SDKValidationError> {
  return safeParse(
    jsonString,
    (x) => PostV3OrganizationsRequest$inboundSchema.parse(JSON.parse(x)),
    `Failed to parse 'PostV3OrganizationsRequest' from JSON`,
  );
}

/** @internal */
export const PostV3OrganizationsResponse$inboundSchema: z.ZodType<
  PostV3OrganizationsResponse,
  z.ZodTypeDef,
  unknown
> = z.union([components.OrganizationDto$inboundSchema, z.string()]);

/** @internal */
export type PostV3OrganizationsResponse$Outbound =
  | components.OrganizationDto$Outbound
  | string;

/** @internal */
export const PostV3OrganizationsResponse$outboundSchema: z.ZodType<
  PostV3OrganizationsResponse$Outbound,
  z.ZodTypeDef,
  PostV3OrganizationsResponse
> = z.union([components.OrganizationDto$outboundSchema, z.string()]);

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace PostV3OrganizationsResponse$ {
  /** @deprecated use `PostV3OrganizationsResponse$inboundSchema` instead. */
  export const inboundSchema = PostV3OrganizationsResponse$inboundSchema;
  /** @deprecated use `PostV3OrganizationsResponse$outboundSchema` instead. */
  export const outboundSchema = PostV3OrganizationsResponse$outboundSchema;
  /** @deprecated use `PostV3OrganizationsResponse$Outbound` instead. */
  export type Outbound = PostV3OrganizationsResponse$Outbound;
}

export function postV3OrganizationsResponseToJSON(
  postV3OrganizationsResponse: PostV3OrganizationsResponse,
): string {
  return JSON.stringify(
    PostV3OrganizationsResponse$outboundSchema.parse(
      postV3OrganizationsResponse,
    ),
  );
}

export function postV3OrganizationsResponseFromJSON(
  jsonString: string,
): SafeParseResult<PostV3OrganizationsResponse, SDKValidationError> {
  return safeParse(
    jsonString,
    (x) => PostV3OrganizationsResponse$inboundSchema.parse(JSON.parse(x)),
    `Failed to parse 'PostV3OrganizationsResponse' from JSON`,
  );
}
