/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import { registrationsPutV3RegistrationsId } from "../../funcs/registrationsPutV3RegistrationsId.js";
import * as operations from "../../models/operations/index.js";
import { formatResult, ToolDefinition } from "../tools.js";

const args = {
  request: operations.PutV3RegistrationsIdRequest$inboundSchema,
};

export const tool$registrationsPutV3RegistrationsId: ToolDefinition<
  typeof args
> = {
  name: "registrations_put-v3-registrations-id",
  description: ``,
  args,
  tool: async (client, args, ctx) => {
    const [result, apiCall] = await registrationsPutV3RegistrationsId(
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
