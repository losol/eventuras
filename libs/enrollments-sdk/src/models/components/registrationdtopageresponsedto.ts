/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import * as z from "zod";
import { safeParse } from "../../lib/schemas.js";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";
import {
  RegistrationDto,
  RegistrationDto$inboundSchema,
  RegistrationDto$Outbound,
  RegistrationDto$outboundSchema,
} from "./registrationdto.js";

export type RegistrationDtoPageResponseDto = {
  page?: number | undefined;
  count?: number | undefined;
  total?: number | undefined;
  pages?: number | undefined;
  data?: Array<RegistrationDto> | null | undefined;
};

/** @internal */
export const RegistrationDtoPageResponseDto$inboundSchema: z.ZodType<
  RegistrationDtoPageResponseDto,
  z.ZodTypeDef,
  unknown
> = z.object({
  page: z.number().int().optional(),
  count: z.number().int().optional(),
  total: z.number().int().optional(),
  pages: z.number().int().optional(),
  data: z.nullable(z.array(RegistrationDto$inboundSchema)).optional(),
});

/** @internal */
export type RegistrationDtoPageResponseDto$Outbound = {
  page?: number | undefined;
  count?: number | undefined;
  total?: number | undefined;
  pages?: number | undefined;
  data?: Array<RegistrationDto$Outbound> | null | undefined;
};

/** @internal */
export const RegistrationDtoPageResponseDto$outboundSchema: z.ZodType<
  RegistrationDtoPageResponseDto$Outbound,
  z.ZodTypeDef,
  RegistrationDtoPageResponseDto
> = z.object({
  page: z.number().int().optional(),
  count: z.number().int().optional(),
  total: z.number().int().optional(),
  pages: z.number().int().optional(),
  data: z.nullable(z.array(RegistrationDto$outboundSchema)).optional(),
});

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace RegistrationDtoPageResponseDto$ {
  /** @deprecated use `RegistrationDtoPageResponseDto$inboundSchema` instead. */
  export const inboundSchema = RegistrationDtoPageResponseDto$inboundSchema;
  /** @deprecated use `RegistrationDtoPageResponseDto$outboundSchema` instead. */
  export const outboundSchema = RegistrationDtoPageResponseDto$outboundSchema;
  /** @deprecated use `RegistrationDtoPageResponseDto$Outbound` instead. */
  export type Outbound = RegistrationDtoPageResponseDto$Outbound;
}

export function registrationDtoPageResponseDtoToJSON(
  registrationDtoPageResponseDto: RegistrationDtoPageResponseDto,
): string {
  return JSON.stringify(
    RegistrationDtoPageResponseDto$outboundSchema.parse(
      registrationDtoPageResponseDto,
    ),
  );
}

export function registrationDtoPageResponseDtoFromJSON(
  jsonString: string,
): SafeParseResult<RegistrationDtoPageResponseDto, SDKValidationError> {
  return safeParse(
    jsonString,
    (x) => RegistrationDtoPageResponseDto$inboundSchema.parse(JSON.parse(x)),
    `Failed to parse 'RegistrationDtoPageResponseDto' from JSON`,
  );
}
