/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import * as z from "zod";
import { remap as remap$ } from "../../lib/primitives.js";
import { safeParse } from "../../lib/schemas.js";
import { Result as SafeParseResult } from "../../types/fp.js";
import * as components from "../components/index.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";

export type PostV3NotificationsEmailRequest = {
  /**
   * Optional organization Id. Will be required in API version 4.
   */
  eventurasOrgId?: number | undefined;
  emailNotificationDto?: components.EmailNotificationDto | undefined;
};

export type PostV3NotificationsEmailResponse =
  | components.NotificationDto
  | string;

/** @internal */
export const PostV3NotificationsEmailRequest$inboundSchema: z.ZodType<
  PostV3NotificationsEmailRequest,
  z.ZodTypeDef,
  unknown
> = z.object({
  "Eventuras-Org-Id": z.number().int().optional(),
  EmailNotificationDto: components.EmailNotificationDto$inboundSchema
    .optional(),
}).transform((v) => {
  return remap$(v, {
    "Eventuras-Org-Id": "eventurasOrgId",
    "EmailNotificationDto": "emailNotificationDto",
  });
});

/** @internal */
export type PostV3NotificationsEmailRequest$Outbound = {
  "Eventuras-Org-Id"?: number | undefined;
  EmailNotificationDto?: components.EmailNotificationDto$Outbound | undefined;
};

/** @internal */
export const PostV3NotificationsEmailRequest$outboundSchema: z.ZodType<
  PostV3NotificationsEmailRequest$Outbound,
  z.ZodTypeDef,
  PostV3NotificationsEmailRequest
> = z.object({
  eventurasOrgId: z.number().int().optional(),
  emailNotificationDto: components.EmailNotificationDto$outboundSchema
    .optional(),
}).transform((v) => {
  return remap$(v, {
    eventurasOrgId: "Eventuras-Org-Id",
    emailNotificationDto: "EmailNotificationDto",
  });
});

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace PostV3NotificationsEmailRequest$ {
  /** @deprecated use `PostV3NotificationsEmailRequest$inboundSchema` instead. */
  export const inboundSchema = PostV3NotificationsEmailRequest$inboundSchema;
  /** @deprecated use `PostV3NotificationsEmailRequest$outboundSchema` instead. */
  export const outboundSchema = PostV3NotificationsEmailRequest$outboundSchema;
  /** @deprecated use `PostV3NotificationsEmailRequest$Outbound` instead. */
  export type Outbound = PostV3NotificationsEmailRequest$Outbound;
}

export function postV3NotificationsEmailRequestToJSON(
  postV3NotificationsEmailRequest: PostV3NotificationsEmailRequest,
): string {
  return JSON.stringify(
    PostV3NotificationsEmailRequest$outboundSchema.parse(
      postV3NotificationsEmailRequest,
    ),
  );
}

export function postV3NotificationsEmailRequestFromJSON(
  jsonString: string,
): SafeParseResult<PostV3NotificationsEmailRequest, SDKValidationError> {
  return safeParse(
    jsonString,
    (x) => PostV3NotificationsEmailRequest$inboundSchema.parse(JSON.parse(x)),
    `Failed to parse 'PostV3NotificationsEmailRequest' from JSON`,
  );
}

/** @internal */
export const PostV3NotificationsEmailResponse$inboundSchema: z.ZodType<
  PostV3NotificationsEmailResponse,
  z.ZodTypeDef,
  unknown
> = z.union([components.NotificationDto$inboundSchema, z.string()]);

/** @internal */
export type PostV3NotificationsEmailResponse$Outbound =
  | components.NotificationDto$Outbound
  | string;

/** @internal */
export const PostV3NotificationsEmailResponse$outboundSchema: z.ZodType<
  PostV3NotificationsEmailResponse$Outbound,
  z.ZodTypeDef,
  PostV3NotificationsEmailResponse
> = z.union([components.NotificationDto$outboundSchema, z.string()]);

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace PostV3NotificationsEmailResponse$ {
  /** @deprecated use `PostV3NotificationsEmailResponse$inboundSchema` instead. */
  export const inboundSchema = PostV3NotificationsEmailResponse$inboundSchema;
  /** @deprecated use `PostV3NotificationsEmailResponse$outboundSchema` instead. */
  export const outboundSchema = PostV3NotificationsEmailResponse$outboundSchema;
  /** @deprecated use `PostV3NotificationsEmailResponse$Outbound` instead. */
  export type Outbound = PostV3NotificationsEmailResponse$Outbound;
}

export function postV3NotificationsEmailResponseToJSON(
  postV3NotificationsEmailResponse: PostV3NotificationsEmailResponse,
): string {
  return JSON.stringify(
    PostV3NotificationsEmailResponse$outboundSchema.parse(
      postV3NotificationsEmailResponse,
    ),
  );
}

export function postV3NotificationsEmailResponseFromJSON(
  jsonString: string,
): SafeParseResult<PostV3NotificationsEmailResponse, SDKValidationError> {
  return safeParse(
    jsonString,
    (x) => PostV3NotificationsEmailResponse$inboundSchema.parse(JSON.parse(x)),
    `Failed to parse 'PostV3NotificationsEmailResponse' from JSON`,
  );
}
