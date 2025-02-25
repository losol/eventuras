/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import { notificationsGetV3NotificationsId } from "../../funcs/notificationsGetV3NotificationsId.js";
import * as operations from "../../models/operations/index.js";
import { formatResult, ToolDefinition } from "../tools.js";

const args = {
  request: operations.GetV3NotificationsIdRequest$inboundSchema,
};

export const tool$notificationsGetV3NotificationsId: ToolDefinition<
  typeof args
> = {
  name: "notifications_get-v3-notifications-id",
  description: ``,
  args,
  tool: async (client, args, ctx) => {
    const [result, apiCall] = await notificationsGetV3NotificationsId(
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
