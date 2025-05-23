/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import { registrationCertificatePostV3RegistrationsIdCertificateSend } from "../../funcs/registrationCertificatePostV3RegistrationsIdCertificateSend.js";
import * as operations from "../../models/operations/index.js";
import { formatResult, ToolDefinition } from "../tools.js";

const args = {
  request: operations.PostV3RegistrationsIdCertificateSendRequest$inboundSchema,
};

export const tool$registrationCertificatePostV3RegistrationsIdCertificateSend:
  ToolDefinition<typeof args> = {
    name: "registration-certificate_post-v3-registrations-id-certificate-send",
    description: ``,
    args,
    tool: async (client, args, ctx) => {
      const [result, apiCall] =
        await registrationCertificatePostV3RegistrationsIdCertificateSend(
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
