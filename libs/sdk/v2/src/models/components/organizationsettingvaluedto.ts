/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import * as z from "zod";
import { safeParse } from "../../lib/schemas.js";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";

export type OrganizationSettingValueDto = {
  name: string;
  value?: string | null | undefined;
};

/** @internal */
export const OrganizationSettingValueDto$inboundSchema: z.ZodType<
  OrganizationSettingValueDto,
  z.ZodTypeDef,
  unknown
> = z.object({
  name: z.string(),
  value: z.nullable(z.string()).optional(),
});

/** @internal */
export type OrganizationSettingValueDto$Outbound = {
  name: string;
  value?: string | null | undefined;
};

/** @internal */
export const OrganizationSettingValueDto$outboundSchema: z.ZodType<
  OrganizationSettingValueDto$Outbound,
  z.ZodTypeDef,
  OrganizationSettingValueDto
> = z.object({
  name: z.string(),
  value: z.nullable(z.string()).optional(),
});

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace OrganizationSettingValueDto$ {
  /** @deprecated use `OrganizationSettingValueDto$inboundSchema` instead. */
  export const inboundSchema = OrganizationSettingValueDto$inboundSchema;
  /** @deprecated use `OrganizationSettingValueDto$outboundSchema` instead. */
  export const outboundSchema = OrganizationSettingValueDto$outboundSchema;
  /** @deprecated use `OrganizationSettingValueDto$Outbound` instead. */
  export type Outbound = OrganizationSettingValueDto$Outbound;
}

export function organizationSettingValueDtoToJSON(
  organizationSettingValueDto: OrganizationSettingValueDto,
): string {
  return JSON.stringify(
    OrganizationSettingValueDto$outboundSchema.parse(
      organizationSettingValueDto,
    ),
  );
}

export function organizationSettingValueDtoFromJSON(
  jsonString: string,
): SafeParseResult<OrganizationSettingValueDto, SDKValidationError> {
  return safeParse(
    jsonString,
    (x) => OrganizationSettingValueDto$inboundSchema.parse(JSON.parse(x)),
    `Failed to parse 'OrganizationSettingValueDto' from JSON`,
  );
}
