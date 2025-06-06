/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import * as z from "zod";
import { safeParse } from "../../lib/schemas.js";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";
import {
  EventInfoRegistrationPolicyDto,
  EventInfoRegistrationPolicyDto$inboundSchema,
  EventInfoRegistrationPolicyDto$Outbound,
  EventInfoRegistrationPolicyDto$outboundSchema,
} from "./eventinforegistrationpolicydto.js";

export type EventInfoOptionsDto = {
  registrationPolicy?: EventInfoRegistrationPolicyDto | undefined;
};

/** @internal */
export const EventInfoOptionsDto$inboundSchema: z.ZodType<
  EventInfoOptionsDto,
  z.ZodTypeDef,
  unknown
> = z.object({
  registrationPolicy: EventInfoRegistrationPolicyDto$inboundSchema.optional(),
});

/** @internal */
export type EventInfoOptionsDto$Outbound = {
  registrationPolicy?: EventInfoRegistrationPolicyDto$Outbound | undefined;
};

/** @internal */
export const EventInfoOptionsDto$outboundSchema: z.ZodType<
  EventInfoOptionsDto$Outbound,
  z.ZodTypeDef,
  EventInfoOptionsDto
> = z.object({
  registrationPolicy: EventInfoRegistrationPolicyDto$outboundSchema.optional(),
});

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace EventInfoOptionsDto$ {
  /** @deprecated use `EventInfoOptionsDto$inboundSchema` instead. */
  export const inboundSchema = EventInfoOptionsDto$inboundSchema;
  /** @deprecated use `EventInfoOptionsDto$outboundSchema` instead. */
  export const outboundSchema = EventInfoOptionsDto$outboundSchema;
  /** @deprecated use `EventInfoOptionsDto$Outbound` instead. */
  export type Outbound = EventInfoOptionsDto$Outbound;
}

export function eventInfoOptionsDtoToJSON(
  eventInfoOptionsDto: EventInfoOptionsDto,
): string {
  return JSON.stringify(
    EventInfoOptionsDto$outboundSchema.parse(eventInfoOptionsDto),
  );
}

export function eventInfoOptionsDtoFromJSON(
  jsonString: string,
): SafeParseResult<EventInfoOptionsDto, SDKValidationError> {
  return safeParse(
    jsonString,
    (x) => EventInfoOptionsDto$inboundSchema.parse(JSON.parse(x)),
    `Failed to parse 'EventInfoOptionsDto' from JSON`,
  );
}
