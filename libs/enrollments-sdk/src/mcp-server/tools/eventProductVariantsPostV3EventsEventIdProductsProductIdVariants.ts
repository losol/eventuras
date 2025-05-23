/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import { eventProductVariantsPostV3EventsEventIdProductsProductIdVariants } from "../../funcs/eventProductVariantsPostV3EventsEventIdProductsProductIdVariants.js";
import * as operations from "../../models/operations/index.js";
import { formatResult, ToolDefinition } from "../tools.js";

const args = {
  request:
    operations
      .PostV3EventsEventIdProductsProductIdVariantsRequest$inboundSchema,
};

export const tool$eventProductVariantsPostV3EventsEventIdProductsProductIdVariants:
  ToolDefinition<typeof args> = {
    name:
      "event-product-variants_post-v3-events-event-id-products-product-id-variants",
    description: ``,
    args,
    tool: async (client, args, ctx) => {
      const [result, apiCall] =
        await eventProductVariantsPostV3EventsEventIdProductsProductIdVariants(
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

      return formatResult(void 0, apiCall);
    },
  };
