/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import * as z from "zod";
import { ClosedEnum } from "../../types/enums.js";

export const PeriodMatchingKind = {
  Match: "Match",
  Intersect: "Intersect",
  Contain: "Contain",
} as const;
export type PeriodMatchingKind = ClosedEnum<typeof PeriodMatchingKind>;

/** @internal */
export const PeriodMatchingKind$inboundSchema: z.ZodNativeEnum<
  typeof PeriodMatchingKind
> = z.nativeEnum(PeriodMatchingKind);

/** @internal */
export const PeriodMatchingKind$outboundSchema: z.ZodNativeEnum<
  typeof PeriodMatchingKind
> = PeriodMatchingKind$inboundSchema;

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace PeriodMatchingKind$ {
  /** @deprecated use `PeriodMatchingKind$inboundSchema` instead. */
  export const inboundSchema = PeriodMatchingKind$inboundSchema;
  /** @deprecated use `PeriodMatchingKind$outboundSchema` instead. */
  export const outboundSchema = PeriodMatchingKind$outboundSchema;
}
