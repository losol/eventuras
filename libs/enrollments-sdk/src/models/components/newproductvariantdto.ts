/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import * as z from "zod";
import { safeParse } from "../../lib/schemas.js";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";

export type NewProductVariantDto = {
  name?: string | null | undefined;
  description?: string | null | undefined;
  price?: number | undefined;
  vatPercent?: number | undefined;
};

/** @internal */
export const NewProductVariantDto$inboundSchema: z.ZodType<
  NewProductVariantDto,
  z.ZodTypeDef,
  unknown
> = z.object({
  name: z.nullable(z.string()).optional(),
  description: z.nullable(z.string()).optional(),
  price: z.number().optional(),
  vatPercent: z.number().int().optional(),
});

/** @internal */
export type NewProductVariantDto$Outbound = {
  name?: string | null | undefined;
  description?: string | null | undefined;
  price?: number | undefined;
  vatPercent?: number | undefined;
};

/** @internal */
export const NewProductVariantDto$outboundSchema: z.ZodType<
  NewProductVariantDto$Outbound,
  z.ZodTypeDef,
  NewProductVariantDto
> = z.object({
  name: z.nullable(z.string()).optional(),
  description: z.nullable(z.string()).optional(),
  price: z.number().optional(),
  vatPercent: z.number().int().optional(),
});

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace NewProductVariantDto$ {
  /** @deprecated use `NewProductVariantDto$inboundSchema` instead. */
  export const inboundSchema = NewProductVariantDto$inboundSchema;
  /** @deprecated use `NewProductVariantDto$outboundSchema` instead. */
  export const outboundSchema = NewProductVariantDto$outboundSchema;
  /** @deprecated use `NewProductVariantDto$Outbound` instead. */
  export type Outbound = NewProductVariantDto$Outbound;
}

export function newProductVariantDtoToJSON(
  newProductVariantDto: NewProductVariantDto,
): string {
  return JSON.stringify(
    NewProductVariantDto$outboundSchema.parse(newProductVariantDto),
  );
}

export function newProductVariantDtoFromJSON(
  jsonString: string,
): SafeParseResult<NewProductVariantDto, SDKValidationError> {
  return safeParse(
    jsonString,
    (x) => NewProductVariantDto$inboundSchema.parse(JSON.parse(x)),
    `Failed to parse 'NewProductVariantDto' from JSON`,
  );
}
