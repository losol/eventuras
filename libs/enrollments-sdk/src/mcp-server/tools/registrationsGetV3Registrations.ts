/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import { registrationsGetV3Registrations } from "../../funcs/registrationsGetV3Registrations.js";
import * as operations from "../../models/operations/index.js";
import { formatResult, ToolDefinition } from "../tools.js";

const args = {
  request: operations.GetV3RegistrationsRequest$inboundSchema,
};

export const tool$registrationsGetV3Registrations: ToolDefinition<typeof args> =
  {
    name: "registrations_get-v3-registrations",
    description: `Get registrations with optional Excel export

Retrieves registrations with optional export to Excel based on the Accept header.`,
    args,
    tool: async (client, args, ctx) => {
      const [result, apiCall] = await registrationsGetV3Registrations(
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
