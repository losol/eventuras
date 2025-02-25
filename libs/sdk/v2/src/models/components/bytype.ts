/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import * as z from "zod";
import { safeParse } from "../../lib/schemas.js";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";

export type ByType = {
  participant?: number | undefined;
  student?: number | undefined;
  staff?: number | undefined;
  lecturer?: number | undefined;
  artist?: number | undefined;
};

/** @internal */
export const ByType$inboundSchema: z.ZodType<ByType, z.ZodTypeDef, unknown> = z
  .object({
    participant: z.number().int().optional(),
    student: z.number().int().optional(),
    staff: z.number().int().optional(),
    lecturer: z.number().int().optional(),
    artist: z.number().int().optional(),
  });

/** @internal */
export type ByType$Outbound = {
  participant?: number | undefined;
  student?: number | undefined;
  staff?: number | undefined;
  lecturer?: number | undefined;
  artist?: number | undefined;
};

/** @internal */
export const ByType$outboundSchema: z.ZodType<
  ByType$Outbound,
  z.ZodTypeDef,
  ByType
> = z.object({
  participant: z.number().int().optional(),
  student: z.number().int().optional(),
  staff: z.number().int().optional(),
  lecturer: z.number().int().optional(),
  artist: z.number().int().optional(),
});

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace ByType$ {
  /** @deprecated use `ByType$inboundSchema` instead. */
  export const inboundSchema = ByType$inboundSchema;
  /** @deprecated use `ByType$outboundSchema` instead. */
  export const outboundSchema = ByType$outboundSchema;
  /** @deprecated use `ByType$Outbound` instead. */
  export type Outbound = ByType$Outbound;
}

export function byTypeToJSON(byType: ByType): string {
  return JSON.stringify(ByType$outboundSchema.parse(byType));
}

export function byTypeFromJSON(
  jsonString: string,
): SafeParseResult<ByType, SDKValidationError> {
  return safeParse(
    jsonString,
    (x) => ByType$inboundSchema.parse(JSON.parse(x)),
    `Failed to parse 'ByType' from JSON`,
  );
}
