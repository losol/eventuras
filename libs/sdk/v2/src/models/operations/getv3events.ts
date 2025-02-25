/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import * as z from "zod";
import { remap as remap$ } from "../../lib/primitives.js";
import { safeParse } from "../../lib/schemas.js";
import { Result as SafeParseResult } from "../../types/fp.js";
import { RFCDate } from "../../types/rfcdate.js";
import * as components from "../components/index.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";

export type GetV3EventsRequest = {
  type?: components.EventInfoType | undefined;
  start?: RFCDate | undefined;
  end?: RFCDate | undefined;
  period?: components.PeriodMatchingKind | undefined;
  includePastEvents?: boolean | undefined;
  includeDraftEvents?: boolean | undefined;
  organizationId?: number | undefined;
  collectionId?: number | undefined;
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
export const GetV3EventsRequest$inboundSchema: z.ZodType<
  GetV3EventsRequest,
  z.ZodTypeDef,
  unknown
> = z.object({
  Type: components.EventInfoType$inboundSchema.optional(),
  Start: z.string().transform(v => new RFCDate(v)).optional(),
  End: z.string().transform(v => new RFCDate(v)).optional(),
  Period: components.PeriodMatchingKind$inboundSchema.optional(),
  IncludePastEvents: z.boolean().optional(),
  IncludeDraftEvents: z.boolean().optional(),
  OrganizationId: z.number().int().optional(),
  CollectionId: z.number().int().optional(),
  Page: z.number().int().optional(),
  Count: z.number().int().optional(),
  Limit: z.number().int().optional(),
  Offset: z.number().int().optional(),
  Ordering: z.array(z.string()).optional(),
  "Eventuras-Org-Id": z.number().int().optional(),
}).transform((v) => {
  return remap$(v, {
    "Type": "type",
    "Start": "start",
    "End": "end",
    "Period": "period",
    "IncludePastEvents": "includePastEvents",
    "IncludeDraftEvents": "includeDraftEvents",
    "OrganizationId": "organizationId",
    "CollectionId": "collectionId",
    "Page": "page",
    "Count": "count",
    "Limit": "limit",
    "Offset": "offset",
    "Ordering": "ordering",
    "Eventuras-Org-Id": "eventurasOrgId",
  });
});

/** @internal */
export type GetV3EventsRequest$Outbound = {
  Type?: string | undefined;
  Start?: string | undefined;
  End?: string | undefined;
  Period?: string | undefined;
  IncludePastEvents?: boolean | undefined;
  IncludeDraftEvents?: boolean | undefined;
  OrganizationId?: number | undefined;
  CollectionId?: number | undefined;
  Page?: number | undefined;
  Count?: number | undefined;
  Limit?: number | undefined;
  Offset?: number | undefined;
  Ordering?: Array<string> | undefined;
  "Eventuras-Org-Id"?: number | undefined;
};

/** @internal */
export const GetV3EventsRequest$outboundSchema: z.ZodType<
  GetV3EventsRequest$Outbound,
  z.ZodTypeDef,
  GetV3EventsRequest
> = z.object({
  type: components.EventInfoType$outboundSchema.optional(),
  start: z.instanceof(RFCDate).transform(v => v.toString()).optional(),
  end: z.instanceof(RFCDate).transform(v => v.toString()).optional(),
  period: components.PeriodMatchingKind$outboundSchema.optional(),
  includePastEvents: z.boolean().optional(),
  includeDraftEvents: z.boolean().optional(),
  organizationId: z.number().int().optional(),
  collectionId: z.number().int().optional(),
  page: z.number().int().optional(),
  count: z.number().int().optional(),
  limit: z.number().int().optional(),
  offset: z.number().int().optional(),
  ordering: z.array(z.string()).optional(),
  eventurasOrgId: z.number().int().optional(),
}).transform((v) => {
  return remap$(v, {
    type: "Type",
    start: "Start",
    end: "End",
    period: "Period",
    includePastEvents: "IncludePastEvents",
    includeDraftEvents: "IncludeDraftEvents",
    organizationId: "OrganizationId",
    collectionId: "CollectionId",
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
export namespace GetV3EventsRequest$ {
  /** @deprecated use `GetV3EventsRequest$inboundSchema` instead. */
  export const inboundSchema = GetV3EventsRequest$inboundSchema;
  /** @deprecated use `GetV3EventsRequest$outboundSchema` instead. */
  export const outboundSchema = GetV3EventsRequest$outboundSchema;
  /** @deprecated use `GetV3EventsRequest$Outbound` instead. */
  export type Outbound = GetV3EventsRequest$Outbound;
}

export function getV3EventsRequestToJSON(
  getV3EventsRequest: GetV3EventsRequest,
): string {
  return JSON.stringify(
    GetV3EventsRequest$outboundSchema.parse(getV3EventsRequest),
  );
}

export function getV3EventsRequestFromJSON(
  jsonString: string,
): SafeParseResult<GetV3EventsRequest, SDKValidationError> {
  return safeParse(
    jsonString,
    (x) => GetV3EventsRequest$inboundSchema.parse(JSON.parse(x)),
    `Failed to parse 'GetV3EventsRequest' from JSON`,
  );
}
