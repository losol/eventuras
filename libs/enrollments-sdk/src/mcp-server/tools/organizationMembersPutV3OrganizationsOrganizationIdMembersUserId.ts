/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import { organizationMembersPutV3OrganizationsOrganizationIdMembersUserId } from "../../funcs/organizationMembersPutV3OrganizationsOrganizationIdMembersUserId.js";
import * as operations from "../../models/operations/index.js";
import { formatResult, ToolDefinition } from "../tools.js";

const args = {
  request:
    operations
      .PutV3OrganizationsOrganizationIdMembersUserIdRequest$inboundSchema,
};

export const tool$organizationMembersPutV3OrganizationsOrganizationIdMembersUserId:
  ToolDefinition<typeof args> = {
    name:
      "organization-members_put-v3-organizations-organization-id-members-user-id",
    description: ``,
    args,
    tool: async (client, args, ctx) => {
      const [result, apiCall] =
        await organizationMembersPutV3OrganizationsOrganizationIdMembersUserId(
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
