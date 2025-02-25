/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import * as z from "zod";
import { safeParse } from "../../lib/schemas.js";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";

export type ProductVariantDto = {
  productVariantId?: number | undefined;
  name?: string | null | undefined;
  description?: string | null | undefined;
  price?: number | undefined;
  vatPercent?: number | undefined;
};

/** @internal */
export const ProductVariantDto$inboundSchema: z.ZodType<
  ProductVariantDto,
  z.ZodTypeDef,
  unknown
> = z.object({
  productVariantId: z.number().int().optional(),
  name: z.nullable(z.string()).optional(),
  description: z.nullable(z.string()).optional(),
  price: z.number().optional(),
  vatPercent: z.number().int().optional(),
});

/** @internal */
export type ProductVariantDto$Outbound = {
  productVariantId?: number | undefined;
  name?: string | null | undefined;
  description?: string | null | undefined;
  price?: number | undefined;
  vatPercent?: number | undefined;
};

/** @internal */
export const ProductVariantDto$outboundSchema: z.ZodType<
  ProductVariantDto$Outbound,
  z.ZodTypeDef,
  ProductVariantDto
> = z.object({
  productVariantId: z.number().int().optional(),
  name: z.nullable(z.string()).optional(),
  description: z.nullable(z.string()).optional(),
  price: z.number().optional(),
  vatPercent: z.number().int().optional(),
});

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace ProductVariantDto$ {
  /** @deprecated use `ProductVariantDto$inboundSchema` instead. */
  export const inboundSchema = ProductVariantDto$inboundSchema;
  /** @deprecated use `ProductVariantDto$outboundSchema` instead. */
  export const outboundSchema = ProductVariantDto$outboundSchema;
  /** @deprecated use `ProductVariantDto$Outbound` instead. */
  export type Outbound = ProductVariantDto$Outbound;
}

export function productVariantDtoToJSON(
  productVariantDto: ProductVariantDto,
): string {
  return JSON.stringify(
    ProductVariantDto$outboundSchema.parse(productVariantDto),
  );
}

export function productVariantDtoFromJSON(
  jsonString: string,
): SafeParseResult<ProductVariantDto, SDKValidationError> {
  return safeParse(
    jsonString,
    (x) => ProductVariantDto$inboundSchema.parse(JSON.parse(x)),
    `Failed to parse 'ProductVariantDto' from JSON`,
  );
}
