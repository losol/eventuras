/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import * as z from "zod";
import { safeParse } from "../../lib/schemas.js";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";
import {
  OrganizationMemberRoleDto,
  OrganizationMemberRoleDto$inboundSchema,
  OrganizationMemberRoleDto$Outbound,
  OrganizationMemberRoleDto$outboundSchema,
} from "./organizationmemberroledto.js";

export type OrganizationMemberDto = {
  id?: number | undefined;
  userId?: string | null | undefined;
  organizationId?: number | undefined;
  roles?: Array<OrganizationMemberRoleDto> | null | undefined;
};

/** @internal */
export const OrganizationMemberDto$inboundSchema: z.ZodType<
  OrganizationMemberDto,
  z.ZodTypeDef,
  unknown
> = z.object({
  id: z.number().int().optional(),
  userId: z.nullable(z.string()).optional(),
  organizationId: z.number().int().optional(),
  roles: z.nullable(z.array(OrganizationMemberRoleDto$inboundSchema))
    .optional(),
});

/** @internal */
export type OrganizationMemberDto$Outbound = {
  id?: number | undefined;
  userId?: string | null | undefined;
  organizationId?: number | undefined;
  roles?: Array<OrganizationMemberRoleDto$Outbound> | null | undefined;
};

/** @internal */
export const OrganizationMemberDto$outboundSchema: z.ZodType<
  OrganizationMemberDto$Outbound,
  z.ZodTypeDef,
  OrganizationMemberDto
> = z.object({
  id: z.number().int().optional(),
  userId: z.nullable(z.string()).optional(),
  organizationId: z.number().int().optional(),
  roles: z.nullable(z.array(OrganizationMemberRoleDto$outboundSchema))
    .optional(),
});

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace OrganizationMemberDto$ {
  /** @deprecated use `OrganizationMemberDto$inboundSchema` instead. */
  export const inboundSchema = OrganizationMemberDto$inboundSchema;
  /** @deprecated use `OrganizationMemberDto$outboundSchema` instead. */
  export const outboundSchema = OrganizationMemberDto$outboundSchema;
  /** @deprecated use `OrganizationMemberDto$Outbound` instead. */
  export type Outbound = OrganizationMemberDto$Outbound;
}

export function organizationMemberDtoToJSON(
  organizationMemberDto: OrganizationMemberDto,
): string {
  return JSON.stringify(
    OrganizationMemberDto$outboundSchema.parse(organizationMemberDto),
  );
}

export function organizationMemberDtoFromJSON(
  jsonString: string,
): SafeParseResult<OrganizationMemberDto, SDKValidationError> {
  return safeParse(
    jsonString,
    (x) => OrganizationMemberDto$inboundSchema.parse(JSON.parse(x)),
    `Failed to parse 'OrganizationMemberDto' from JSON`,
  );
}
