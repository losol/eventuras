/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import { userProfileGetV3Userprofile } from "../../funcs/userProfileGetV3Userprofile.js";
import * as operations from "../../models/operations/index.js";
import { formatResult, ToolDefinition } from "../tools.js";

const args = {
  request: operations.GetV3UserprofileRequest$inboundSchema,
};

export const tool$userProfileGetV3Userprofile: ToolDefinition<typeof args> = {
  name: "user-profile_get-v3-userprofile",
  description:
    `Gets information about the current user. Creates a new user if no user with the email exists.`,
  args,
  tool: async (client, args, ctx) => {
    const [result, apiCall] = await userProfileGetV3Userprofile(
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
