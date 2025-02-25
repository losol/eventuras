/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import {
  GetV3InvoicesIdAcceptEnum,
  invoicesGetV3InvoicesId,
} from "../funcs/invoicesGetV3InvoicesId.js";
import {
  invoicesPostV3Invoices,
  PostV3InvoicesAcceptEnum,
} from "../funcs/invoicesPostV3Invoices.js";
import { ClientSDK, RequestOptions } from "../lib/sdks.js";
import * as operations from "../models/operations/index.js";
import { unwrapAsync } from "../types/fp.js";

export { GetV3InvoicesIdAcceptEnum } from "../funcs/invoicesGetV3InvoicesId.js";

export { PostV3InvoicesAcceptEnum } from "../funcs/invoicesPostV3Invoices.js";

export class Invoices extends ClientSDK {
  async getV3InvoicesId(
    request: operations.GetV3InvoicesIdRequest,
    options?: RequestOptions & {
      acceptHeaderOverride?: GetV3InvoicesIdAcceptEnum;
    },
  ): Promise<operations.GetV3InvoicesIdResponse> {
    return unwrapAsync(invoicesGetV3InvoicesId(
      this,
      request,
      options,
    ));
  }

  async postV3Invoices(
    request: operations.PostV3InvoicesRequest,
    options?: RequestOptions & {
      acceptHeaderOverride?: PostV3InvoicesAcceptEnum;
    },
  ): Promise<operations.PostV3InvoicesResponse> {
    return unwrapAsync(invoicesPostV3Invoices(
      this,
      request,
      options,
    ));
  }
}
