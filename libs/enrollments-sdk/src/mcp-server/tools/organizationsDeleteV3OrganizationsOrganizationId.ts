/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import { organizationsDeleteV3OrganizationsOrganizationId } from "../../funcs/organizationsDeleteV3OrganizationsOrganizationId.js";
import * as operations from "../../models/operations/index.js";
import { formatResult, ToolDefinition } from "../tools.js";

const args = {
  request: operations.DeleteV3OrganizationsOrganizationIdRequest$inboundSchema,
};

export const tool$organizationsDeleteV3OrganizationsOrganizationId:
  ToolDefinition<typeof args> = {
    name: "organizations_delete-v3-organizations-organization-id",
    description: ``,
    args,
    tool: async (client, args, ctx) => {
      const [result, apiCall] =
        await organizationsDeleteV3OrganizationsOrganizationId(
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
