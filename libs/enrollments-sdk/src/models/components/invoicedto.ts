/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import * as z from "zod";
import { safeParse } from "../../lib/schemas.js";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";

export type InvoiceDto = {
  invoiceId?: number | undefined;
  externalInvoiceId?: string | null | undefined;
  paid?: boolean | undefined;
  orderIds?: Array<number> | null | undefined;
};

/** @internal */
export const InvoiceDto$inboundSchema: z.ZodType<
  InvoiceDto,
  z.ZodTypeDef,
  unknown
> = z.object({
  invoiceId: z.number().int().optional(),
  externalInvoiceId: z.nullable(z.string()).optional(),
  paid: z.boolean().optional(),
  orderIds: z.nullable(z.array(z.number().int())).optional(),
});

/** @internal */
export type InvoiceDto$Outbound = {
  invoiceId?: number | undefined;
  externalInvoiceId?: string | null | undefined;
  paid?: boolean | undefined;
  orderIds?: Array<number> | null | undefined;
};

/** @internal */
export const InvoiceDto$outboundSchema: z.ZodType<
  InvoiceDto$Outbound,
  z.ZodTypeDef,
  InvoiceDto
> = z.object({
  invoiceId: z.number().int().optional(),
  externalInvoiceId: z.nullable(z.string()).optional(),
  paid: z.boolean().optional(),
  orderIds: z.nullable(z.array(z.number().int())).optional(),
});

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace InvoiceDto$ {
  /** @deprecated use `InvoiceDto$inboundSchema` instead. */
  export const inboundSchema = InvoiceDto$inboundSchema;
  /** @deprecated use `InvoiceDto$outboundSchema` instead. */
  export const outboundSchema = InvoiceDto$outboundSchema;
  /** @deprecated use `InvoiceDto$Outbound` instead. */
  export type Outbound = InvoiceDto$Outbound;
}

export function invoiceDtoToJSON(invoiceDto: InvoiceDto): string {
  return JSON.stringify(InvoiceDto$outboundSchema.parse(invoiceDto));
}

export function invoiceDtoFromJSON(
  jsonString: string,
): SafeParseResult<InvoiceDto, SDKValidationError> {
  return safeParse(
    jsonString,
    (x) => InvoiceDto$inboundSchema.parse(JSON.parse(x)),
    `Failed to parse 'InvoiceDto' from JSON`,
  );
}
