/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import * as z from "zod";
import { remap as remap$ } from "../../lib/primitives.js";
import { safeParse } from "../../lib/schemas.js";
import { Result as SafeParseResult } from "../../types/fp.js";
import * as components from "../components/index.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";

export type PutV3UsersIdRequest = {
  id: string;
  /**
   * Optional organization Id. Will be required in API version 4.
   */
  eventurasOrgId?: number | undefined;
  userFormDto?: components.UserFormDto | undefined;
};

export type PutV3UsersIdResponse = components.UserDto | string;

/** @internal */
export const PutV3UsersIdRequest$inboundSchema: z.ZodType<
  PutV3UsersIdRequest,
  z.ZodTypeDef,
  unknown
> = z.object({
  id: z.string(),
  "Eventuras-Org-Id": z.number().int().optional(),
  UserFormDto: components.UserFormDto$inboundSchema.optional(),
}).transform((v) => {
  return remap$(v, {
    "Eventuras-Org-Id": "eventurasOrgId",
    "UserFormDto": "userFormDto",
  });
});

/** @internal */
export type PutV3UsersIdRequest$Outbound = {
  id: string;
  "Eventuras-Org-Id"?: number | undefined;
  UserFormDto?: components.UserFormDto$Outbound | undefined;
};

/** @internal */
export const PutV3UsersIdRequest$outboundSchema: z.ZodType<
  PutV3UsersIdRequest$Outbound,
  z.ZodTypeDef,
  PutV3UsersIdRequest
> = z.object({
  id: z.string(),
  eventurasOrgId: z.number().int().optional(),
  userFormDto: components.UserFormDto$outboundSchema.optional(),
}).transform((v) => {
  return remap$(v, {
    eventurasOrgId: "Eventuras-Org-Id",
    userFormDto: "UserFormDto",
  });
});

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace PutV3UsersIdRequest$ {
  /** @deprecated use `PutV3UsersIdRequest$inboundSchema` instead. */
  export const inboundSchema = PutV3UsersIdRequest$inboundSchema;
  /** @deprecated use `PutV3UsersIdRequest$outboundSchema` instead. */
  export const outboundSchema = PutV3UsersIdRequest$outboundSchema;
  /** @deprecated use `PutV3UsersIdRequest$Outbound` instead. */
  export type Outbound = PutV3UsersIdRequest$Outbound;
}

export function putV3UsersIdRequestToJSON(
  putV3UsersIdRequest: PutV3UsersIdRequest,
): string {
  return JSON.stringify(
    PutV3UsersIdRequest$outboundSchema.parse(putV3UsersIdRequest),
  );
}

export function putV3UsersIdRequestFromJSON(
  jsonString: string,
): SafeParseResult<PutV3UsersIdRequest, SDKValidationError> {
  return safeParse(
    jsonString,
    (x) => PutV3UsersIdRequest$inboundSchema.parse(JSON.parse(x)),
    `Failed to parse 'PutV3UsersIdRequest' from JSON`,
  );
}

/** @internal */
export const PutV3UsersIdResponse$inboundSchema: z.ZodType<
  PutV3UsersIdResponse,
  z.ZodTypeDef,
  unknown
> = z.union([components.UserDto$inboundSchema, z.string()]);

/** @internal */
export type PutV3UsersIdResponse$Outbound =
  | components.UserDto$Outbound
  | string;

/** @internal */
export const PutV3UsersIdResponse$outboundSchema: z.ZodType<
  PutV3UsersIdResponse$Outbound,
  z.ZodTypeDef,
  PutV3UsersIdResponse
> = z.union([components.UserDto$outboundSchema, z.string()]);

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace PutV3UsersIdResponse$ {
  /** @deprecated use `PutV3UsersIdResponse$inboundSchema` instead. */
  export const inboundSchema = PutV3UsersIdResponse$inboundSchema;
  /** @deprecated use `PutV3UsersIdResponse$outboundSchema` instead. */
  export const outboundSchema = PutV3UsersIdResponse$outboundSchema;
  /** @deprecated use `PutV3UsersIdResponse$Outbound` instead. */
  export type Outbound = PutV3UsersIdResponse$Outbound;
}

export function putV3UsersIdResponseToJSON(
  putV3UsersIdResponse: PutV3UsersIdResponse,
): string {
  return JSON.stringify(
    PutV3UsersIdResponse$outboundSchema.parse(putV3UsersIdResponse),
  );
}

export function putV3UsersIdResponseFromJSON(
  jsonString: string,
): SafeParseResult<PutV3UsersIdResponse, SDKValidationError> {
  return safeParse(
    jsonString,
    (x) => PutV3UsersIdResponse$inboundSchema.parse(JSON.parse(x)),
    `Failed to parse 'PutV3UsersIdResponse' from JSON`,
  );
}
