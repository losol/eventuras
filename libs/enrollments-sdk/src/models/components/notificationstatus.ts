/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import * as z from "zod";
import { ClosedEnum } from "../../types/enums.js";

export const NotificationStatus = {
  New: "New",
  Queued: "Queued",
  Started: "Started",
  Cancelled: "Cancelled",
  Failed: "Failed",
  Sent: "Sent",
} as const;
export type NotificationStatus = ClosedEnum<typeof NotificationStatus>;

/** @internal */
export const NotificationStatus$inboundSchema: z.ZodNativeEnum<
  typeof NotificationStatus
> = z.nativeEnum(NotificationStatus);

/** @internal */
export const NotificationStatus$outboundSchema: z.ZodNativeEnum<
  typeof NotificationStatus
> = NotificationStatus$inboundSchema;

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace NotificationStatus$ {
  /** @deprecated use `NotificationStatus$inboundSchema` instead. */
  export const inboundSchema = NotificationStatus$inboundSchema;
  /** @deprecated use `NotificationStatus$outboundSchema` instead. */
  export const outboundSchema = NotificationStatus$outboundSchema;
}
