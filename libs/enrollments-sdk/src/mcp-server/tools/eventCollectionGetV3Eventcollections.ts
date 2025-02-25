/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import { eventCollectionGetV3Eventcollections } from "../../funcs/eventCollectionGetV3Eventcollections.js";
import * as operations from "../../models/operations/index.js";
import { formatResult, ToolDefinition } from "../tools.js";

const args = {
  request: operations.GetV3EventcollectionsRequest$inboundSchema,
};

export const tool$eventCollectionGetV3Eventcollections: ToolDefinition<
  typeof args
> = {
  name: "event-collection_get-v3-eventcollections",
  description: ``,
  args,
  tool: async (client, args, ctx) => {
    const [result, apiCall] = await eventCollectionGetV3Eventcollections(
      client,
      args.request,
      { fetchOptions: { signal: ctx.signal } },
    ).$inspect();

    if (!result.ok) {
      return {
        content: [{ type: "text", text: result.error.message }],
        isError: true,
      };
    }

    const value = result.value;

    return formatResult(value, apiCall);
  },
};
