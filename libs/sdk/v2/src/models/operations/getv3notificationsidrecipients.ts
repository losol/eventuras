/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import * as z from "zod";
import { remap as remap$ } from "../../lib/primitives.js";
import { safeParse } from "../../lib/schemas.js";
import { Result as SafeParseResult } from "../../types/fp.js";
import * as components from "../components/index.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";

export type GetV3NotificationsIdRecipientsRequest = {
  id: number;
  query?: string | undefined;
  sentOnly?: boolean | undefined;
  errorsOnly?: boolean | undefined;
  order?: components.NotificationRecipientListOrder | undefined;
  desc?: boolean | undefined;
  page?: number | undefined;
  count?: number | undefined;
  limit?: number | undefined;
  offset?: number | undefined;
  ordering?: Array<string> | undefined;
  /**
   * Optional organization Id. Will be required in API version 4.
   */
  eventurasOrgId?: number | undefined;
};

/** @internal */
export const GetV3NotificationsIdRecipientsRequest$inboundSchema: z.ZodType<
  GetV3NotificationsIdRecipientsRequest,
  z.ZodTypeDef,
  unknown
> = z.object({
  id: z.number().int(),
  Query: z.string().optional(),
  SentOnly: z.boolean().optional(),
  ErrorsOnly: z.boolean().optional(),
  Order: components.NotificationRecipientListOrder$inboundSchema.optional(),
  Desc: z.boolean().optional(),
  Page: z.number().int().optional(),
  Count: z.number().int().optional(),
  Limit: z.number().int().optional(),
  Offset: z.number().int().optional(),
  Ordering: z.array(z.string()).optional(),
  "Eventuras-Org-Id": z.number().int().optional(),
}).transform((v) => {
  return remap$(v, {
    "Query": "query",
    "SentOnly": "sentOnly",
    "ErrorsOnly": "errorsOnly",
    "Order": "order",
    "Desc": "desc",
    "Page": "page",
    "Count": "count",
    "Limit": "limit",
    "Offset": "offset",
    "Ordering": "ordering",
    "Eventuras-Org-Id": "eventurasOrgId",
  });
});

/** @internal */
export type GetV3NotificationsIdRecipientsRequest$Outbound = {
  id: number;
  Query?: string | undefined;
  SentOnly?: boolean | undefined;
  ErrorsOnly?: boolean | undefined;
  Order?: string | undefined;
  Desc?: boolean | undefined;
  Page?: number | undefined;
  Count?: number | undefined;
  Limit?: number | undefined;
  Offset?: number | undefined;
  Ordering?: Array<string> | undefined;
  "Eventuras-Org-Id"?: number | undefined;
};

/** @internal */
export const GetV3NotificationsIdRecipientsRequest$outboundSchema: z.ZodType<
  GetV3NotificationsIdRecipientsRequest$Outbound,
  z.ZodTypeDef,
  GetV3NotificationsIdRecipientsRequest
> = z.object({
  id: z.number().int(),
  query: z.string().optional(),
  sentOnly: z.boolean().optional(),
  errorsOnly: z.boolean().optional(),
  order: components.NotificationRecipientListOrder$outboundSchema.optional(),
  desc: z.boolean().optional(),
  page: z.number().int().optional(),
  count: z.number().int().optional(),
  limit: z.number().int().optional(),
  offset: z.number().int().optional(),
  ordering: z.array(z.string()).optional(),
  eventurasOrgId: z.number().int().optional(),
}).transform((v) => {
  return remap$(v, {
    query: "Query",
    sentOnly: "SentOnly",
    errorsOnly: "ErrorsOnly",
    order: "Order",
    desc: "Desc",
    page: "Page",
    count: "Count",
    limit: "Limit",
    offset: "Offset",
    ordering: "Ordering",
    eventurasOrgId: "Eventuras-Org-Id",
  });
});

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace GetV3NotificationsIdRecipientsRequest$ {
  /** @deprecated use `GetV3NotificationsIdRecipientsRequest$inboundSchema` instead. */
  export const inboundSchema =
    GetV3NotificationsIdRecipientsRequest$inboundSchema;
  /** @deprecated use `GetV3NotificationsIdRecipientsRequest$outboundSchema` instead. */
  export const outboundSchema =
    GetV3NotificationsIdRecipientsRequest$outboundSchema;
  /** @deprecated use `GetV3NotificationsIdRecipientsRequest$Outbound` instead. */
  export type Outbound = GetV3NotificationsIdRecipientsRequest$Outbound;
}

export function getV3NotificationsIdRecipientsRequestToJSON(
  getV3NotificationsIdRecipientsRequest: GetV3NotificationsIdRecipientsRequest,
): string {
  return JSON.stringify(
    GetV3NotificationsIdRecipientsRequest$outboundSchema.parse(
      getV3NotificationsIdRecipientsRequest,
    ),
  );
}

export function getV3NotificationsIdRecipientsRequestFromJSON(
  jsonString: string,
): SafeParseResult<GetV3NotificationsIdRecipientsRequest, SDKValidationError> {
  return safeParse(
    jsonString,
    (x) =>
      GetV3NotificationsIdRecipientsRequest$inboundSchema.parse(JSON.parse(x)),
    `Failed to parse 'GetV3NotificationsIdRecipientsRequest' from JSON`,
  );
}
