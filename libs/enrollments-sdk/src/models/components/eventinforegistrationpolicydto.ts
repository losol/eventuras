/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import * as z from "zod";
import { safeParse } from "../../lib/schemas.js";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";

export type EventInfoRegistrationPolicyDto = {
  allowedRegistrationEditHours?: number | null | undefined;
  allowModificationsAfterCancellationDue?: boolean | undefined;
};

/** @internal */
export const EventInfoRegistrationPolicyDto$inboundSchema: z.ZodType<
  EventInfoRegistrationPolicyDto,
  z.ZodTypeDef,
  unknown
> = z.object({
  allowedRegistrationEditHours: z.nullable(z.number().int()).optional(),
  allowModificationsAfterCancellationDue: z.boolean().optional(),
});

/** @internal */
export type EventInfoRegistrationPolicyDto$Outbound = {
  allowedRegistrationEditHours?: number | null | undefined;
  allowModificationsAfterCancellationDue?: boolean | undefined;
};

/** @internal */
export const EventInfoRegistrationPolicyDto$outboundSchema: z.ZodType<
  EventInfoRegistrationPolicyDto$Outbound,
  z.ZodTypeDef,
  EventInfoRegistrationPolicyDto
> = z.object({
  allowedRegistrationEditHours: z.nullable(z.number().int()).optional(),
  allowModificationsAfterCancellationDue: z.boolean().optional(),
});

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace EventInfoRegistrationPolicyDto$ {
  /** @deprecated use `EventInfoRegistrationPolicyDto$inboundSchema` instead. */
  export const inboundSchema = EventInfoRegistrationPolicyDto$inboundSchema;
  /** @deprecated use `EventInfoRegistrationPolicyDto$outboundSchema` instead. */
  export const outboundSchema = EventInfoRegistrationPolicyDto$outboundSchema;
  /** @deprecated use `EventInfoRegistrationPolicyDto$Outbound` instead. */
  export type Outbound = EventInfoRegistrationPolicyDto$Outbound;
}

export function eventInfoRegistrationPolicyDtoToJSON(
  eventInfoRegistrationPolicyDto: EventInfoRegistrationPolicyDto,
): string {
  return JSON.stringify(
    EventInfoRegistrationPolicyDto$outboundSchema.parse(
      eventInfoRegistrationPolicyDto,
    ),
  );
}

export function eventInfoRegistrationPolicyDtoFromJSON(
  jsonString: string,
): SafeParseResult<EventInfoRegistrationPolicyDto, SDKValidationError> {
  return safeParse(
    jsonString,
    (x) => EventInfoRegistrationPolicyDto$inboundSchema.parse(JSON.parse(x)),
    `Failed to parse 'EventInfoRegistrationPolicyDto' from JSON`,
  );
}
