/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import { usersPutV3UsersId } from "../../funcs/usersPutV3UsersId.js";
import * as operations from "../../models/operations/index.js";
import { formatResult, ToolDefinition } from "../tools.js";

const args = {
  request: operations.PutV3UsersIdRequest$inboundSchema,
};

export const tool$usersPutV3UsersId: ToolDefinition<typeof args> = {
  name: "users_put-v3-users-id",
  description: ``,
  args,
  tool: async (client, args, ctx) => {
    const [result, apiCall] = await usersPutV3UsersId(
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
