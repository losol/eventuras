/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import { eventProductsGetV3EventsEventIdProducts } from "../../funcs/eventProductsGetV3EventsEventIdProducts.js";
import * as operations from "../../models/operations/index.js";
import { formatResult, ToolDefinition } from "../tools.js";

const args = {
  request: operations.GetV3EventsEventIdProductsRequest$inboundSchema,
};

export const tool$eventProductsGetV3EventsEventIdProducts: ToolDefinition<
  typeof args
> = {
  name: "event-products_get-v3-events-event-id-products",
  description: ``,
  args,
  tool: async (client, args, ctx) => {
    const [result, apiCall] = await eventProductsGetV3EventsEventIdProducts(
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
