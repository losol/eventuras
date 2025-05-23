/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import * as z from "zod";
import { safeParse } from "../../lib/schemas.js";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";

export type EventCollectionDto = {
  id?: number | null | undefined;
  organizationId: number;
  name: string;
  slug?: string | null | undefined;
  description?: string | null | undefined;
  featured?: boolean | undefined;
  featuredImageUrl?: string | null | undefined;
  featuredImageCaption?: string | null | undefined;
};

/** @internal */
export const EventCollectionDto$inboundSchema: z.ZodType<
  EventCollectionDto,
  z.ZodTypeDef,
  unknown
> = z.object({
  id: z.nullable(z.number().int()).optional(),
  organizationId: z.number().int(),
  name: z.string(),
  slug: z.nullable(z.string()).optional(),
  description: z.nullable(z.string()).optional(),
  featured: z.boolean().optional(),
  featuredImageUrl: z.nullable(z.string()).optional(),
  featuredImageCaption: z.nullable(z.string()).optional(),
});

/** @internal */
export type EventCollectionDto$Outbound = {
  id?: number | null | undefined;
  organizationId: number;
  name: string;
  slug?: string | null | undefined;
  description?: string | null | undefined;
  featured?: boolean | undefined;
  featuredImageUrl?: string | null | undefined;
  featuredImageCaption?: string | null | undefined;
};

/** @internal */
export const EventCollectionDto$outboundSchema: z.ZodType<
  EventCollectionDto$Outbound,
  z.ZodTypeDef,
  EventCollectionDto
> = z.object({
  id: z.nullable(z.number().int()).optional(),
  organizationId: z.number().int(),
  name: z.string(),
  slug: z.nullable(z.string()).optional(),
  description: z.nullable(z.string()).optional(),
  featured: z.boolean().optional(),
  featuredImageUrl: z.nullable(z.string()).optional(),
  featuredImageCaption: z.nullable(z.string()).optional(),
});

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace EventCollectionDto$ {
  /** @deprecated use `EventCollectionDto$inboundSchema` instead. */
  export const inboundSchema = EventCollectionDto$inboundSchema;
  /** @deprecated use `EventCollectionDto$outboundSchema` instead. */
  export const outboundSchema = EventCollectionDto$outboundSchema;
  /** @deprecated use `EventCollectionDto$Outbound` instead. */
  export type Outbound = EventCollectionDto$Outbound;
}

export function eventCollectionDtoToJSON(
  eventCollectionDto: EventCollectionDto,
): string {
  return JSON.stringify(
    EventCollectionDto$outboundSchema.parse(eventCollectionDto),
  );
}

export function eventCollectionDtoFromJSON(
  jsonString: string,
): SafeParseResult<EventCollectionDto, SDKValidationError> {
  return safeParse(
    jsonString,
    (x) => EventCollectionDto$inboundSchema.parse(JSON.parse(x)),
    `Failed to parse 'EventCollectionDto' from JSON`,
  );
}
