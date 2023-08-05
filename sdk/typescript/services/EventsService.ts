/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { EventDto } from '../models/EventDto';
import type { EventDtoPageResponseDto } from '../models/EventDtoPageResponseDto';
import type { EventFormDto } from '../models/EventFormDto';
import type { EventInfoJsonPatchDocument } from '../models/EventInfoJsonPatchDocument';
import type { EventInfoType } from '../models/EventInfoType';
import type { LocalDate } from '../models/LocalDate';
import type { PeriodMatchingKind } from '../models/PeriodMatchingKind';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class EventsService {

    /**
     * Gets a list of events.
     * @returns EventDtoPageResponseDto Returns a list of events.
     * @throws ApiError
     */
    public static getV3Events({
        type,
        start,
        end,
        period,
        organizationId,
        page,
        count,
        limit,
        offset,
    }: {
        type?: EventInfoType,
        start?: LocalDate,
        end?: LocalDate,
        period?: PeriodMatchingKind,
        organizationId?: number,
        page?: number,
        count?: number,
        limit?: number,
        offset?: number,
    }): CancelablePromise<EventDtoPageResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v3/events',
            query: {
                'Type': type,
                'Start': start,
                'End': end,
                'Period': period,
                'OrganizationId': organizationId,
                'Page': page,
                'Count': count,
                'Limit': limit,
                'Offset': offset,
            },
            errors: {
                400: `If the query is invalid.`,
            },
        });
    }

    /**
     * @returns EventDto Success
     * @throws ApiError
     */
    public static postV3Events({
        requestBody,
    }: {
        requestBody?: EventFormDto,
    }): CancelablePromise<EventDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v3/events',
            body: requestBody,
            mediaType: 'application/json-patch+json',
        });
    }

    /**
     * @returns EventDto Success
     * @throws ApiError
     */
    public static getV3Events1({
        id,
    }: {
        id: number,
    }): CancelablePromise<EventDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v3/events/{id}',
            path: {
                'id': id,
            },
        });
    }

    /**
     * @returns EventDto Success
     * @throws ApiError
     */
    public static putV3Events({
        id,
        requestBody,
    }: {
        id: number,
        requestBody?: EventFormDto,
    }): CancelablePromise<EventDto> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/v3/events/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json-patch+json',
        });
    }

    /**
     * @returns any Success
     * @throws ApiError
     */
    public static patchV3Events({
        id,
        requestBody,
    }: {
        id: number,
        requestBody?: EventInfoJsonPatchDocument,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/v3/events/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json-patch+json',
        });
    }

    /**
     * @returns any Success
     * @throws ApiError
     */
    public static deleteV3Events({
        id,
    }: {
        id: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/v3/events/{id}',
            path: {
                'id': id,
            },
        });
    }

}
