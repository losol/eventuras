/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import { eventCertificatesPostV3EventIdCertificatesUpdate } from "../../funcs/eventCertificatesPostV3EventIdCertificatesUpdate.js";
import * as operations from "../../models/operations/index.js";
import { formatResult, ToolDefinition } from "../tools.js";

const args = {
  request: operations.PostV3EventIdCertificatesUpdateRequest$inboundSchema,
};

export const tool$eventCertificatesPostV3EventIdCertificatesUpdate:
  ToolDefinition<typeof args> = {
    name: "event-certificates_post-v3-event-id-certificates-update",
    description: ``,
    args,
    tool: async (client, args, ctx) => {
      const [result, apiCall] =
        await eventCertificatesPostV3EventIdCertificatesUpdate(
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
