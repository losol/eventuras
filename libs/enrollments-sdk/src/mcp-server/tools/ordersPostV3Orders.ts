/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import { ordersPostV3Orders } from "../../funcs/ordersPostV3Orders.js";
import * as operations from "../../models/operations/index.js";
import { formatResult, ToolDefinition } from "../tools.js";

const args = {
  request: operations.PostV3OrdersRequest$inboundSchema,
};

export const tool$ordersPostV3Orders: ToolDefinition<typeof args> = {
  name: "orders_post-v3-orders",
  description: ``,
  args,
  tool: async (client, args, ctx) => {
    const [result, apiCall] = await ordersPostV3Orders(
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
