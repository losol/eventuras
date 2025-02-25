/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import * as z from "zod";
import { safeParse } from "../../lib/schemas.js";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";
import {
  ProductVisibility,
  ProductVisibility$inboundSchema,
  ProductVisibility$outboundSchema,
} from "./productvisibility.js";

export type NewProductDto = {
  name: string;
  description?: string | null | undefined;
  more?: string | null | undefined;
  price?: number | undefined;
  vatPercent?: number | undefined;
  visibility?: ProductVisibility | undefined;
};

/** @internal */
export const NewProductDto$inboundSchema: z.ZodType<
  NewProductDto,
  z.ZodTypeDef,
  unknown
> = z.object({
  name: z.string(),
  description: z.nullable(z.string()).optional(),
  more: z.nullable(z.string()).optional(),
  price: z.number().optional(),
  vatPercent: z.number().int().optional(),
  visibility: ProductVisibility$inboundSchema.optional(),
});

/** @internal */
export type NewProductDto$Outbound = {
  name: string;
  description?: string | null | undefined;
  more?: string | null | undefined;
  price?: number | undefined;
  vatPercent?: number | undefined;
  visibility?: string | undefined;
};

/** @internal */
export const NewProductDto$outboundSchema: z.ZodType<
  NewProductDto$Outbound,
  z.ZodTypeDef,
  NewProductDto
> = z.object({
  name: z.string(),
  description: z.nullable(z.string()).optional(),
  more: z.nullable(z.string()).optional(),
  price: z.number().optional(),
  vatPercent: z.number().int().optional(),
  visibility: ProductVisibility$outboundSchema.optional(),
});

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace NewProductDto$ {
  /** @deprecated use `NewProductDto$inboundSchema` instead. */
  export const inboundSchema = NewProductDto$inboundSchema;
  /** @deprecated use `NewProductDto$outboundSchema` instead. */
  export const outboundSchema = NewProductDto$outboundSchema;
  /** @deprecated use `NewProductDto$Outbound` instead. */
  export type Outbound = NewProductDto$Outbound;
}

export function newProductDtoToJSON(newProductDto: NewProductDto): string {
  return JSON.stringify(NewProductDto$outboundSchema.parse(newProductDto));
}

export function newProductDtoFromJSON(
  jsonString: string,
): SafeParseResult<NewProductDto, SDKValidationError> {
  return safeParse(
    jsonString,
    (x) => NewProductDto$inboundSchema.parse(JSON.parse(x)),
    `Failed to parse 'NewProductDto' from JSON`,
  );
}
