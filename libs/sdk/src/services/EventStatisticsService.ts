/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { EventStatisticsDto } from '../models/EventStatisticsDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class EventStatisticsService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * @returns EventStatisticsDto Success
     * @throws ApiError
     */
    public getV3EventsStatistics({
        eventId,
        eventurasOrgId,
    }: {
        eventId: number,
        /**
         * Optional organization Id. Will be required in API version 4.
         */
        eventurasOrgId?: number,
    }): CancelablePromise<EventStatisticsDto> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/v3/events/{eventId}/statistics',
            path: {
                'eventId': eventId,
            },
            headers: {
                'Eventuras-Org-Id': eventurasOrgId,
            },
        });
    }
}
