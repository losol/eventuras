/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import {
  eventStatisticsGetV3EventsEventIdStatistics,
  GetV3EventsEventIdStatisticsAcceptEnum,
} from "../funcs/eventStatisticsGetV3EventsEventIdStatistics.js";
import { ClientSDK, RequestOptions } from "../lib/sdks.js";
import * as operations from "../models/operations/index.js";
import { unwrapAsync } from "../types/fp.js";

export { GetV3EventsEventIdStatisticsAcceptEnum } from "../funcs/eventStatisticsGetV3EventsEventIdStatistics.js";

export class EventStatistics extends ClientSDK {
  /**
   * Event statistics
   *
   * @remarks
   * Returns a summary of the registrations for the event.
   */
  async getV3EventsEventIdStatistics(
    request: operations.GetV3EventsEventIdStatisticsRequest,
    options?: RequestOptions & {
      acceptHeaderOverride?: GetV3EventsEventIdStatisticsAcceptEnum;
    },
  ): Promise<operations.GetV3EventsEventIdStatisticsResponse> {
    return unwrapAsync(eventStatisticsGetV3EventsEventIdStatistics(
      this,
      request,
      options,
    ));
  }
}
